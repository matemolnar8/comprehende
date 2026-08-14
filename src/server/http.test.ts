import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { cmdGenerate } from "../cli/commands.ts";
import { startServer } from "./http.ts";
import { createExampleRepo, SECRET_ADD, SECRET_DEL } from "../test/example-repo.ts";

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

describe("serve API", () => {
  it("joins live git hunks and keeps patch text out of the review document", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-serve-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const dataPath = join(root, "review.json");
    const document = await cmdGenerate(repo.root, dataPath, repo.base, repo.head);
    const running = await startServer({ cwd: repo.root, dataPath, port: 0 });
    servers.push(running.server);

    const health = await fetch(`${running.url}/api/health`);
    assert.equal(health.status, 200);

    const reviewRes = await fetch(`${running.url}/api/review`);
    assert.equal(reviewRes.status, 200);
    const review = (await reviewRes.json()) as {
      coverage: { totalHunks: number; unassignedCount: number };
      groups: { id: string; hunkCount: number }[];
      document: unknown;
    };
    const reviewText = JSON.stringify(review.document);
    assert.equal(reviewText.includes(SECRET_ADD), false);
    assert.equal(reviewText.includes(SECRET_DEL), false);
    assert.equal(review.coverage.unassignedCount, 0);
    assert.ok(review.coverage.totalHunks >= 4);

    const group = document.groups[0];
    assert.ok(group);
    const hunksRes = await fetch(`${running.url}/api/hunks?group=${encodeURIComponent(group.id)}`);
    assert.equal(hunksRes.status, 200);
    const payload = (await hunksRes.json()) as { hunks: { path: string; lines: { text: string }[] }[] };
    assert.ok(payload.hunks.length > 0);

    const appGroup = document.groups.find((item) => item.hunkRefs.some((ref) => ref.path === "src/app.ts"));
    assert.ok(appGroup);
    const appHunks = await fetch(`${running.url}/api/hunks?group=${encodeURIComponent(appGroup.id)}`);
    const appPayload = (await appHunks.json()) as { hunks: { lines: { kind: string; text: string }[] }[] };
    const texts = appPayload.hunks.flatMap((hunk) => hunk.lines.map((line) => line.text)).join("\n");
    assert.equal(texts.includes(SECRET_ADD), true);

    const fileRes = await fetch(`${running.url}/api/file?path=src/app.ts&side=new`);
    assert.equal(fileRes.status, 200);
    const file = (await fileRes.json()) as { content: string };
    assert.equal(file.content.includes(SECRET_ADD), true);

    const blameRes = await fetch(`${running.url}/api/blame?path=src/app.ts&side=new`);
    assert.equal(blameRes.status, 200);
    const blame = (await blameRes.json()) as { lines: unknown[] };
    assert.ok(blame.lines.length > 0);
  });
});
