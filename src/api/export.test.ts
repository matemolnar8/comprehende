import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { cmdIndex } from "../cli/commands.ts";
import { startServer, startStaticSite } from "../server/http.ts";
import { writeCoveringDocument } from "../test/covering-document.ts";
import { createExampleRepo, SECRET_ADD, SECRET_DEL } from "../test/example-repo.ts";
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

describe("export static site", () => {
  it("matches live serve payloads on the example fixture", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-export-"));
    roots.push(root);
    const repo = await createExampleRepo(join(root, "repo"));
    const dataPath = join(root, "review.json");
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    await writeCoveringDocument(dataPath, index);

    const uiRoot = join(root, "ui");
    await mkdir(uiRoot);
    await writeFile(join(uiRoot, "index.html"), "<!doctype html><div id=\"root\"></div>\n");

    const live = await startServer({ cwd: repo.root, dataPath, port: 0, uiRoot });
    servers.push(live.server);

    const outDir = join(root, "site");
    const ctx = await openReview(repo.root, dataPath);
    await exportStaticSite({ cwd: repo.root, dataPath, outDir, uiRoot, ctx });

    assert.equal(existsSync(join(outDir, ".git")), false);
    assert.equal(existsSync(join(outDir, "index.html")), true);

    const frozen = await startStaticSite(outDir, 0);
    servers.push(frozen.server);

    const resources = listResources(ctx);
    assert.ok(resources.length > 4);

    for (const resource of resources) {
      const href = new URL(apiHref(resource), `${live.url}/`).href;
      const liveRes = await fetch(href);
      const frozenRes = await fetch(new URL(apiHref(resource), `${frozen.url}/`).href);
      assert.equal(frozenRes.status, liveRes.status, `${apiHref(resource)} status`);
      if (liveRes.status !== 200) {
        continue;
      }
      assert.deepEqual(await frozenRes.json(), await liveRes.json(), apiHref(resource));
    }

    const review = (await (await fetch(new URL(apiHref({ kind: "review" }), `${frozen.url}/`))).json()) as {
      document: unknown;
      groups: { hunkCount: number }[];
    };
    const reviewText = JSON.stringify(review.document);
    assert.equal(reviewText.includes(SECRET_ADD), false);
    assert.equal(reviewText.includes(SECRET_DEL), false);
    assert.ok((review.groups[0]?.hunkCount ?? 0) >= 4);

    const app = await fetch(new URL(apiHref({ kind: "file", path: "src/app.ts", side: "new" }), `${frozen.url}/`));
    assert.equal(app.status, 200);
    const file = (await app.json()) as { content: string };
    assert.equal(file.content.includes(SECRET_ADD), true);
  });

  it("refuses unresolved source refs", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-export-badref-"));
    roots.push(root);
    const repo = await createExampleRepo(join(root, "repo"));
    const dataPath = join(root, "review.json");
    const index = await cmdIndex(repo.root, repo.base, repo.head);
    const document = await writeCoveringDocument(dataPath, index);
    document.source.baseRef = "no-such-base";
    await writeFile(dataPath, `${JSON.stringify(document, null, 2)}\n`);

    const uiRoot = join(root, "ui");
    await mkdir(uiRoot);
    await writeFile(join(uiRoot, "index.html"), "<!doctype html>\n");

    await assert.rejects(
      () => exportStaticSite({ cwd: repo.root, dataPath, outDir: join(root, "site"), uiRoot }),
      /no-such-base|Needed a single revision|unknown revision|ambiguous argument/i,
    );
  });
});
