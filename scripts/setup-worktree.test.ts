import assert from "node:assert/strict";
import { realpathSync, rmSync } from "node:fs";
import { mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, it } from "vite-plus/test";
import { git } from "../src/git/exec.ts";
import { initEmptyRepo } from "../src/test/init-repo.ts";
import { mainCheckout } from "./setup-worktree.ts";

const roots: string[] = [];

afterAll(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("setup-worktree", () => {
  it("finds the main checkout from a linked worktree", async () => {
    const root = realpathSync(await mkdtemp(join(tmpdir(), "comprehende-setup-test-")));
    roots.push(root);
    const main = join(root, "main");
    const linked = join(root, "linked");
    await initEmptyRepo(main);
    await writeFile(join(main, "README.md"), "# test\n");
    await git(main, ["add", "."]);
    await git(main, ["commit", "-m", "init"]);
    await git(main, ["worktree", "add", "-b", "side", linked]);

    assert.equal(mainCheckout(linked), main);
    assert.equal(mainCheckout(main), main);
  });
});
