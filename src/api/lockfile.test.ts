import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { cmdIndex } from "../cli/commands.ts";
import { startServer, startStaticSite } from "../server/http.ts";
import { writeCoveringDocument } from "../test/covering-document.ts";
import { APP_SECRET, createLockfileRepo, LOCKFILE_SECRET } from "../test/lockfile-repo.ts";
import { listResources, openReview } from "./live.ts";
import { apiHref } from "./paths.ts";
import { exportStaticSite } from "./snapshot.ts";

const roots: string[] = [];
const servers: { close: (cb: (error?: Error) => void) => void }[] = [];

after(async () => {
  await Promise.all(
    servers.map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("lockfile payloads", () => {
  it("omits lockfile patch from the layer until the patch resource is read", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-lock-api-"));
    roots.push(root);
    const repo = await createLockfileRepo(join(root, "repo"));
    const dataPath = join(root, "review.json");
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    await writeCoveringDocument(dataPath, index);

    const uiRoot = join(root, "ui");
    await mkdir(uiRoot);
    await writeFile(join(uiRoot, "index.html"), "<!doctype html><div id=\"root\"></div>\n");

    const live = await startServer({ cwd: repo.root, dataPath, port: 0, uiRoot });
    servers.push(live.server);

    const reviewRes = await fetch(new URL(apiHref({ kind: "review" }), `${live.url}/`));
    const review = (await reviewRes.json()) as {
      groups: { id: string }[];
      lockfiles: { fileCount: number; files: string[] };
    };
    const groupId = review.groups[0]?.id;
    assert.ok(groupId);
    assert.equal(review.lockfiles.fileCount, 2);
    assert.ok(review.lockfiles.files.includes("package-lock.json"));
    assert.ok(review.lockfiles.files.includes("apps/web/yarn.lock"));

    const hunksRes = await fetch(new URL(apiHref({ kind: "hunks", group: groupId }), `${live.url}/`));
    const payload = (await hunksRes.json()) as {
      files: { path: string; kind: string; patch: string; added?: number; removed?: number }[];
    };
    const encoded = JSON.stringify(payload);
    assert.equal(encoded.includes(LOCKFILE_SECRET), false);
    assert.equal(encoded.includes(APP_SECRET), true);
    assert.equal(payload.files.some((file) => file.path === "package-lock.json"), false);

    const app = payload.files.find((file) => file.path === "src/app.ts");
    assert.ok(app);
    assert.equal(app.kind, "text");
    assert.equal(app.patch.includes(APP_SECRET), true);

    const lockfilesRes = await fetch(new URL(apiHref({ kind: "hunks", group: "lockfiles" }), `${live.url}/`));
    const lockfiles = (await lockfilesRes.json()) as {
      files: { path: string; kind: string; patch: string; added?: number; removed?: number }[];
    };
    assert.equal(JSON.stringify(lockfiles).includes(LOCKFILE_SECRET), false);
    const lock = lockfiles.files.find((file) => file.path === "package-lock.json");
    assert.ok(lock);
    assert.equal(lock.kind, "lockfile");
    assert.equal(lock.patch, "");
    assert.ok((lock.added ?? 0) > 0);

    const yarn = lockfiles.files.find((file) => file.path === "apps/web/yarn.lock");
    assert.ok(yarn);
    assert.equal(yarn.kind, "lockfile");
    assert.equal(yarn.patch, "");

    const patchRes = await fetch(new URL(apiHref({ kind: "patch", path: "package-lock.json" }), `${live.url}/`));
    assert.equal(patchRes.status, 200);
    const patch = (await patchRes.json()) as { path: string; kind: string; patch: string };
    assert.equal(patch.kind, "lockfile");
    assert.equal(patch.patch.includes(LOCKFILE_SECRET), true);
    assert.equal(patch.patch.startsWith("diff --git "), true);

    const missing = await fetch(new URL(apiHref({ kind: "patch", path: "src/app.ts" }), `${live.url}/`));
    assert.equal(missing.status, 404);

    const outDir = join(root, "site");
    const ctx = await openReview(repo.root, dataPath);
    await exportStaticSite({ cwd: repo.root, dataPath, outDir, uiRoot, ctx });
    const frozen = await startStaticSite(outDir, 0);
    servers.push(frozen.server);

    const patchResource = listResources(ctx).find(
      (resource) => resource.kind === "patch" && resource.path === "package-lock.json",
    );
    assert.ok(patchResource);
    const livePatch = await (await fetch(new URL(apiHref(patchResource), `${live.url}/`))).json();
    const frozenPatch = await (await fetch(new URL(apiHref(patchResource), `${frozen.url}/`))).json();
    assert.deepEqual(frozenPatch, livePatch);
  });
});
