import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { createExampleRepo } from "../test/example-repo.ts";
import { createImageRepo } from "../test/image-repo.ts";
import { readImageBlob } from "./blob.ts";
import { git } from "./exec.ts";
import { readHunkIndex } from "./diff.ts";
import { assertWorkTree, gitCommonDir, readRepoIdentity } from "./repo.ts";

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("linked git worktree", () => {
  it("indexes, names, and reads LFS from the worktree cwd", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-worktree-"));
    roots.push(root);
    const repo = await createExampleRepo(join(root, "widgets"));
    const linked = join(root, "t3code-linked");
    await git(repo.root, ["worktree", "add", "--detach", linked, "HEAD"]);

    await assertWorkTree(linked);
    assert.equal(realpathSync(await gitCommonDir(linked)), realpathSync(await gitCommonDir(repo.root)));

    const identity = await readRepoIdentity(linked);
    assert.equal(identity.origin, null);
    assert.equal(identity.name, "widgets");

    const fromMain = await readHunkIndex(repo.root, repo.base, repo.head);
    const fromLinked = await readHunkIndex(linked, repo.base, repo.head);
    assert.deepEqual(fromLinked, fromMain);
  });

  it("reads Git LFS objects stored in the common git dir", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-worktree-lfs-"));
    roots.push(root);
    const repo = await createImageRepo(join(root, "shots"));
    const linked = join(root, "linked");
    await git(repo.root, ["worktree", "add", "--detach", linked, "HEAD"]);

    const blob = await readImageBlob(linked, repo.head, "shots/home.png");
    assert.equal(blob.ok, true);
    if (blob.ok) {
      assert.equal(blob.lfs, true);
      assert.deepEqual(blob.bytes, repo.lfsNew);
    }
  });
});
