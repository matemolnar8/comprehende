import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { createExampleRepo } from "../test/example-repo.ts";
import { git } from "./exec.ts";

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("git exec", () => {
  it("uses cwd when GIT_DIR and GIT_WORK_TREE point at another repository", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-gitenv-"));
    roots.push(root);
    const other = await createExampleRepo(join(root, "other"));
    const previousDir = process.env.GIT_DIR;
    const previousWorkTree = process.env.GIT_WORK_TREE;
    process.env.GIT_DIR = join(other.root, ".git");
    process.env.GIT_WORK_TREE = other.root;
    try {
      const target = await createExampleRepo(join(root, "target"));
      const top = (await git(target.root, ["rev-parse", "--show-toplevel"])).trim();
      assert.equal(realpathSync(top), realpathSync(target.root));
      assert.notEqual(realpathSync(top), realpathSync(other.root));
    } finally {
      restoreEnv("GIT_DIR", previousDir);
      restoreEnv("GIT_WORK_TREE", previousWorkTree);
    }
  });
});

function restoreEnv(key: string, previous: string | undefined): void {
  if (previous === undefined) {
    delete process.env[key];
    return;
  }
  process.env[key] = previous;
}
