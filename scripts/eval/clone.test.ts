import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { git } from "../../src/git/exec.ts";
import { initEmptyRepo } from "../../src/test/init-repo.ts";
import { cloneCaseBundle, writeCaseBundle } from "./clone.ts";

const roots: string[] = [];
after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

async function commit(cwd: string, file: string, message: string): Promise<string> {
  await writeFile(join(cwd, file), `${message}\n`);
  await git(cwd, ["add", "."]);
  await git(cwd, ["commit", "-m", message]);
  return (await git(cwd, ["rev-parse", "HEAD"])).trim();
}

describe("case bundle", () => {
  it("cuts history at base and still diffs base...head offline", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-bundle-"));
    roots.push(root);
    const src = join(root, "src");
    await initEmptyRepo(src);
    await commit(src, "old.txt", "before base");
    const base = await commit(src, "a.txt", "base");
    await commit(src, "b.txt", "one");
    const head = await commit(src, "c.txt", "two");

    const bundle = join(root, "repo.bundle");
    await writeCaseBundle(src, base, head, bundle);
    const bare = join(root, "clone.git");
    await cloneCaseBundle({ bundle, dest: bare, base, repoUrl: "https://github.com/o/r.git" });

    assert.equal((await git(bare, ["rev-list", "--count", `${base}..${head}`])).trim(), "2");
    assert.equal((await git(bare, ["merge-base", base, head])).trim(), base);
    assert.equal((await git(bare, ["rev-list", "--count", head])).trim(), "3");
    assert.deepEqual((await git(bare, ["diff", "--name-only", `${base}...${head}`])).trim().split("\n"), ["b.txt", "c.txt"]);
    assert.equal((await git(bare, ["config", "--get", "remote.origin.url"])).trim(), "https://github.com/o/r.git");
  });

  it("refuses a base that is not an ancestor of head", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-bundle-"));
    roots.push(root);
    await initEmptyRepo(root);
    const first = await commit(root, "a.txt", "first");
    const second = await commit(root, "b.txt", "second");
    await assert.rejects(writeCaseBundle(root, second, first, join(root, "x.bundle")), /not an ancestor/);
  });
});
