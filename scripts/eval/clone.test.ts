import assert from "node:assert/strict";
import { mkdir, mkdtemp, readdir, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, it, onTestFinished } from "vite-plus/test";
import { git } from "../../src/git/exec.ts";
import { initEmptyRepo } from "../../src/test/init-repo.ts";
import { cloneCaseBundle, cloneCaseFromCache, withLock, writeCaseBundle } from "./clone.ts";

const roots: string[] = [];
afterAll(() => {
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
    assert.deepEqual(
      (await git(bare, ["diff", "--name-only", `${base}...${head}`])).trim().split("\n"),
      ["b.txt", "c.txt"],
    );
    assert.equal(
      (await git(bare, ["config", "--get", "remote.origin.url"])).trim(),
      "https://github.com/o/r.git",
    );
  });

  it("refuses a base that is not an ancestor of head", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-bundle-"));
    roots.push(root);
    await initEmptyRepo(root);
    const first = await commit(root, "a.txt", "first");
    const second = await commit(root, "b.txt", "second");
    await assert.rejects(
      writeCaseBundle(root, second, first, join(root, "x.bundle")),
      /not an ancestor/,
    );
  });
});

describe("clone cache", () => {
  it("fills one cache entry when parallel runs start on a cold cache", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-cache-"));
    roots.push(root);
    const src = join(root, "src");
    await initEmptyRepo(src);
    await git(src, ["remote", "add", "origin", "https://github.com/o/r.git"]);
    const base = await commit(src, "a.txt", "base");
    const head = await commit(src, "b.txt", "head");
    const cacheDir = join(root, "cache");
    // Point the GitHub URL at the local repo so the fetch stays offline.
    process.env.GIT_CONFIG_COUNT = "1";
    process.env.GIT_CONFIG_KEY_0 = `url.${src}.insteadOf`;
    process.env.GIT_CONFIG_VALUE_0 = "https://github.com/o/r.git";
    onTestFinished(() => {
      delete process.env.GIT_CONFIG_COUNT;
      delete process.env.GIT_CONFIG_KEY_0;
      delete process.env.GIT_CONFIG_VALUE_0;
    });
    const dests = [1, 2, 3, 4].map((n) => join(root, `run-${n}.git`));
    await Promise.all(
      dests.map((dest) =>
        cloneCaseFromCache({
          cacheDir,
          repoUrl: "https://github.com/o/r.git",
          localMirror: src,
          pr: 1,
          base,
          head,
          dest,
        }),
      ),
    );
    for (const dest of dests) {
      assert.equal((await git(dest, ["rev-parse", "refs/eval/head"])).trim(), head);
      assert.equal(
        (await git(dest, ["config", "--get", "remote.origin.url"])).trim(),
        "https://github.com/o/r.git",
      );
    }
    assert.deepEqual(await readdir(cacheDir), ["o-r.git"]);
  });

  it("takes over a lock whose owner died", async () => {
    const root = await mkdtemp(join(tmpdir(), "eval-lock-"));
    roots.push(root);
    const lock = join(root, "x.lock");
    await mkdir(lock);
    await writeFile(join(lock, "pid"), "999999999");
    assert.equal(await withLock(lock, async () => "ran"), "ran");
  });
});
