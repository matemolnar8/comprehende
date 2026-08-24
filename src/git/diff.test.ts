import { parsePatchFiles } from "@pierre/diffs";
import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { classifyDiffFiles, filePatchFromGit, parseUnifiedDiff, readDiff, readHunkIndex, readPathDiff } from "./diff.ts";
import { APP_SECRET, createLockfileRepo, LOCKFILE_SECRET } from "../test/lockfile-repo.ts";

const SAMPLE = `diff --git a/src/app.ts b/src/app.ts
index 111..222 100644
--- a/src/app.ts
+++ b/src/app.ts
@@ -1,3 +1,4 @@
 export const name = "app";
+export const extra = true;
 export function start() {
   return name;
@@ -20,3 +21,4 @@ export function end() {
   return "end";
 }
+export const tail = 1;
diff --git a/src/util.ts b/src/helpers.ts
similarity index 80%
rename from src/util.ts
rename to src/helpers.ts
index 111..222 100644
--- a/src/util.ts
+++ b/src/helpers.ts
@@ -1,3 +1,3 @@
-export const label = "util";
+export const label = "helpers";
 export function help() {
   return 1;
diff --git a/assets/dot.bin b/assets/dot.bin
index 111..222 100644
Binary files a/assets/dot.bin and b/assets/dot.bin differ
`;

describe("parseUnifiedDiff", () => {
  it("parses multi-hunk files, renames, and skips binaries", () => {
    const files = parseUnifiedDiff(SAMPLE);
    assert.equal(files.length, 3);

    const app = files[0];
    assert.ok(app);
    assert.equal(app.path, "src/app.ts");
    assert.equal(app.hunks.length, 2);
    assert.equal(app.hunks[0]?.oldStart, 1);
    assert.equal(app.hunks[0]?.newStart, 1);
    assert.equal(app.hunks[1]?.oldStart, 20);
    assert.equal(app.hunks[0]?.lines.some((line) => line.kind === "add" && line.text.includes("extra")), true);

    const renamed = files[1];
    assert.ok(renamed);
    assert.equal(renamed.status, "renamed");
    assert.equal(renamed.oldPath, "src/util.ts");
    assert.equal(renamed.path, "src/helpers.ts");
    assert.equal(renamed.hunks[0]?.oldPath, "src/util.ts");

    const binary = files[2];
    assert.ok(binary);
    assert.equal(binary.binary, true);
    assert.equal(binary.image, false);
    assert.equal(binary.hunks.length, 0);
  });

  it("keeps git's file patches as slices of the original diff", () => {
    const files = parseUnifiedDiff(SAMPLE);
    assert.equal(files.map((file) => file.patch).join(""), SAMPLE);
    assert.equal(files[0]?.patch.includes("index 111..222 100644"), true);
    assert.equal(files[0]?.headerPatch.startsWith("diff --git a/src/app.ts b/src/app.ts\n"), true);
    assert.equal(files[0]?.headerPatch.includes("@@"), false);
    assert.equal(files[0]?.hunks[0]?.patch.startsWith("@@ -1,3 +1,4 @@\n"), true);

    const first = files[0];
    const firstHunk = first?.hunks[0];
    assert.ok(first);
    assert.ok(firstHunk);
    const subset = filePatchFromGit(first, [firstHunk]);
    assert.equal(subset.includes("index 111..222 100644"), true);
    assert.equal(subset.includes("export const extra = true;"), true);
    assert.equal(subset.includes("export const tail = 1;"), false);
    assert.equal(filePatchFromGit(first, first.hunks), first.patch);
    const parsed = parsePatchFiles(first.patch, "git");
    assert.equal(parsed[0]?.files[0]?.name, "src/app.ts");
    assert.equal(parsed[0]?.files[0]?.hunks.length, 2);
  });
});

const IMAGE_SAMPLE = `diff --git a/assets/shot.png b/assets/shot.png
index 111..222 100644
Binary files a/assets/shot.png and b/assets/shot.png differ
diff --git a/shots/home.png b/shots/home.png
index 111..222 100644
--- a/shots/home.png
+++ b/shots/home.png
@@ -1,3 +1,3 @@
 version https://git-lfs.github.com/spec/v1
-oid sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
+oid sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
 size 12
`;

const TEXT_PNG_SAMPLE = `diff --git a/shots/welcome.png b/shots/welcome.png
index 111..222 100644
--- a/shots/welcome.png
+++ b/shots/welcome.png
@@ -88,3 +88,3 @@
 context
-old
+new
@@ -156,2 +156,2 @@
 more
-before
+after
`;

describe("classifyDiffFiles", () => {
  it("turns binary and LFS pointer image files into one image hunk", () => {
    const files = classifyDiffFiles(parseUnifiedDiff(IMAGE_SAMPLE));
    assert.equal(files.length, 2);

    const binary = files[0];
    assert.ok(binary);
    assert.equal(binary.image, true);
    assert.equal(binary.hunks.length, 1);
    assert.equal(binary.hunks[0]?.oldStart, 0);
    assert.equal(binary.hunks[0]?.newStart, 0);
    assert.equal(binary.hunks[0]?.header, "image");

    const lfs = files[1];
    assert.ok(lfs);
    assert.equal(lfs.binary, false);
    assert.equal(lfs.image, true);
    assert.equal(lfs.hunks.length, 1);
    assert.equal(lfs.hunks[0]?.path, "shots/home.png");
  });

  it("turns a text-diffed image path into one image hunk", () => {
    const files = classifyDiffFiles(parseUnifiedDiff(TEXT_PNG_SAMPLE));
    assert.equal(files.length, 1);
    const png = files[0];
    assert.ok(png);
    assert.equal(png.binary, false);
    assert.equal(png.image, true);
    assert.equal(png.hunks.length, 1);
    assert.equal(png.hunks[0]?.oldStart, 0);
    assert.equal(png.hunks[0]?.newStart, 0);
    assert.equal(png.hunks[0]?.header, "image");
  });

  it("leaves non-image binaries without hunks", () => {
    const files = classifyDiffFiles(parseUnifiedDiff(SAMPLE));
    const binary = files[2];
    assert.ok(binary);
    assert.equal(binary.image, false);
    assert.equal(binary.hunks.length, 0);
  });
});

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("lockfile diffs", () => {
  it("stubs lockfiles without patch text and loads them by path", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-lock-"));
    roots.push(root);
    const repo = await createLockfileRepo(root);
    const files = await readDiff(repo.root, repo.base, repo.head);
    const encoded = JSON.stringify(files);
    assert.equal(encoded.includes(LOCKFILE_SECRET), false);
    assert.equal(encoded.includes(APP_SECRET), true);

    const lock = files.find((file) => file.path === "package-lock.json");
    assert.ok(lock);
    assert.equal(lock.patch, "");
    assert.equal(lock.hunks.length, 0);
    assert.ok((lock.added ?? 0) > 0);

    const yarn = files.find((file) => file.path === "apps/web/yarn.lock");
    assert.ok(yarn);
    assert.equal(yarn.patch, "");

    const app = files.find((file) => file.path === "src/app.ts");
    assert.ok(app);
    assert.equal(app.patch.includes(APP_SECRET), true);

    const bun = files.find((file) => file.path === "bun.lockb");
    assert.ok(bun);
    assert.equal(bun.binary, true);
    assert.equal(bun.hunks.length, 0);

    const live = await readPathDiff(repo.root, repo.base, repo.head, "package-lock.json");
    assert.ok(live);
    assert.equal(live.patch.includes(LOCKFILE_SECRET), true);
    assert.equal(live.patch.startsWith("diff --git "), true);

    const index = await readHunkIndex(repo.root, repo.base, repo.head);
    assert.equal(JSON.stringify(index).includes(LOCKFILE_SECRET), false);
    assert.equal(index.hunks.some((hunk) => hunk.path === "package-lock.json"), false);
    assert.ok(index.skipped.some((item) => item.path === "package-lock.json" && item.reason === "lockfile"));
    assert.ok(index.skipped.some((item) => item.path === "apps/web/yarn.lock" && item.reason === "lockfile"));
    assert.ok(index.skipped.some((item) => item.path === "bun.lockb"));
  });
});
