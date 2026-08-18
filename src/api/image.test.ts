import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { cmdIndex } from "../cli/commands.ts";
import { startServer, startStaticSite } from "../server/http.ts";
import { writeCoveringDocument } from "../test/covering-document.ts";
import { createImageRepo } from "../test/image-repo.ts";
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

describe("image diffs", () => {
  it("indexes image files, serves bytes, and exports the same files including Git LFS", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-image-"));
    roots.push(root);
    const repo = await createImageRepo(join(root, "repo"));
    const dataPath = join(root, "review.json");
    const index = await cmdIndex(repo.root, repo.base, repo.head);

    assert.ok(index.hunks.some((hunk) => hunk.path === "assets/shot.png" && hunk.oldStart === 0 && hunk.newStart === 0));
    assert.ok(index.hunks.some((hunk) => hunk.path === "shots/home.png"));
    assert.ok(index.skipped.some((item) => item.path === "assets/dot.bin"));
    assert.equal(
      index.hunks.some((hunk) => hunk.path === "assets/dot.bin"),
      false,
    );

    await writeCoveringDocument(dataPath, index);
    const uiRoot = join(root, "ui");
    await mkdir(uiRoot);
    await writeFile(join(uiRoot, "index.html"), "<!doctype html><div id=\"root\"></div>\n");

    const live = await startServer({ cwd: repo.root, dataPath, port: 0, uiRoot });
    servers.push(live.server);

    const reviewRes = await fetch(new URL(apiHref({ kind: "review" }), `${live.url}/`));
    const review = (await reviewRes.json()) as {
      files: { path: string; image: boolean; binary: boolean }[];
      skipped: { path: string }[];
    };
    assert.equal(review.files.find((file) => file.path === "assets/shot.png")?.image, true);
    assert.equal(review.files.find((file) => file.path === "shots/home.png")?.image, true);
    assert.ok(review.skipped.some((item) => item.path === "assets/dot.bin"));

    const shotNew = await fetch(new URL(apiHref({ kind: "image", path: "assets/shot.png", side: "new" }), `${live.url}/`));
    assert.equal(shotNew.status, 200);
    assert.equal(shotNew.headers.get("content-type"), "image/png");
    assert.deepEqual(Buffer.from(await shotNew.arrayBuffer()), repo.shotNew);

    const shotOld = await fetch(new URL(apiHref({ kind: "image", path: "assets/shot.png", side: "old" }), `${live.url}/`));
    assert.deepEqual(Buffer.from(await shotOld.arrayBuffer()), repo.shotOld);

    const lfsNew = await fetch(new URL(apiHref({ kind: "image", path: "shots/home.png", side: "new" }), `${live.url}/`));
    assert.equal(lfsNew.status, 200);
    assert.deepEqual(Buffer.from(await lfsNew.arrayBuffer()), repo.lfsNew);

    const lfsOld = await fetch(new URL(apiHref({ kind: "image", path: "shots/home.png", side: "old" }), `${live.url}/`));
    assert.deepEqual(Buffer.from(await lfsOld.arrayBuffer()), repo.lfsOld);

    const group = (await (await fetch(new URL(apiHref({ kind: "review" }), `${live.url}/`))).json()) as {
      groups: { id: string }[];
    };
    const groupId = group.groups[0]?.id;
    assert.ok(groupId);
    const hunksRes = await fetch(new URL(apiHref({ kind: "hunks", group: groupId }), `${live.url}/`));
    const payload = (await hunksRes.json()) as {
      files: { path: string; kind: string; status: string; hunks: unknown[] }[];
    };
    assert.equal(payload.files.find((file) => file.path === "assets/shot.png")?.kind, "image");
    assert.equal(payload.files.find((file) => file.path === "shots/home.png")?.kind, "image");

    const outDir = join(root, "site");
    const ctx = await openReview(repo.root, dataPath);
    await exportStaticSite({ cwd: repo.root, dataPath, outDir, uiRoot, ctx });
    const frozen = await startStaticSite(outDir, 0);
    servers.push(frozen.server);

    for (const resource of listResources(ctx).filter((item) => item.kind === "image")) {
      const liveBytes = Buffer.from(await (await fetch(new URL(apiHref(resource), `${live.url}/`))).arrayBuffer());
      const frozenBytes = Buffer.from(await (await fetch(new URL(apiHref(resource), `${frozen.url}/`))).arrayBuffer());
      assert.deepEqual(frozenBytes, liveBytes, apiHref(resource));
    }
    assert.equal(existsSync(join(outDir, "api/images/new/assets/shot.png")), true);
    assert.equal(existsSync(join(outDir, "api/images/new/shots/home.png")), true);
  });

  it("returns 404 when the Git LFS object is not in the clone", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-lfs-missing-"));
    roots.push(root);
    const repo = await createImageRepo(join(root, "repo"));
    await rm(join(repo.root, ".git/lfs"), { recursive: true, force: true });
    const dataPath = join(root, "review.json");
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    await writeCoveringDocument(dataPath, index);
    const uiRoot = join(root, "ui");
    await mkdir(uiRoot);
    await writeFile(join(uiRoot, "index.html"), "<!doctype html>\n");
    const live = await startServer({ cwd: repo.root, dataPath, port: 0, uiRoot });
    servers.push(live.server);

    const missing = await fetch(new URL(apiHref({ kind: "image", path: "shots/home.png", side: "new" }), `${live.url}/`));
    assert.equal(missing.status, 404);
    const body = (await missing.json()) as { error: string };
    assert.match(body.error, /Git LFS object/);

    const png = await fetch(new URL(apiHref({ kind: "image", path: "assets/shot.png", side: "new" }), `${live.url}/`));
    assert.equal(png.status, 200);
  });
});
