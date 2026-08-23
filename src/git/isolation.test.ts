import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import { createExampleRepo, SECRET_ADD } from "../test/example-repo.ts";
import { git } from "./exec.ts";
import { pinRange } from "./repo.ts";
import { showFile } from "./show.ts";

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("git isolation", () => {
  it("reads the blob at a pinned SHA after the work tree and HEAD move", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-iso-"));
    roots.push(root);
    const repo = await createExampleRepo(root);
    const pin = await pinRange(repo.root, repo.base, "HEAD");
    const original = await showFile(repo.root, pin.headSha, "src/app.ts");
    assert.equal(original.includes(SECRET_ADD), true);

    await writeFile(join(repo.root, "src/app.ts"), "export const dirty = true;\n");
    await git(repo.root, ["add", "src/app.ts"]);
    await git(repo.root, ["commit", "-m", "overwrite app"]);
    await writeFile(join(repo.root, "src/app.ts"), "export const unstaged = true;\n");

    const pinned = await showFile(repo.root, pin.headSha, "src/app.ts");
    assert.equal(pinned, original);
    assert.equal(pinned.includes("dirty"), false);
    assert.equal(pinned.includes("unstaged"), false);

    const headNow = (await git(repo.root, ["rev-parse", "HEAD"])).trim();
    assert.notEqual(headNow, pin.headSha);
  });
});
