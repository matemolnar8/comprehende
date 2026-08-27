import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { chmod, cp, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { existsSync, realpathSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { after, describe, it } from "node:test";
import { findPackageRoot } from "../package-root.ts";
import { git } from "./exec.ts";

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

describe("core.hooksPath worktrees", () => {
  it("runs the worktree's tracked hook, not a copy in the common git dir", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-hooks-"));
    roots.push(root);
    const main = join(root, "main");
    await initHookRepo(main, "main");
    execFileSync("node", [join(main, "scripts/install-git-hooks.js")], { cwd: main });

    assert.equal((await git(main, ["config", "--get", "core.hooksPath"])).trim(), ".githooks");
    assert.equal(await hooksDir(main), realpathSync(join(main, ".githooks")));

    await git(main, ["commit", "--allow-empty", "-m", "from main"]);
    assert.equal((await readFile(join(main, "hook.out"), "utf8")).trim(), "main");

    const linked = join(root, "linked");
    await git(main, ["worktree", "add", linked, "HEAD"]);
    assert.equal(existsSync(join(linked, ".git")), true);
    assert.equal(await hooksDir(linked), realpathSync(join(linked, ".githooks")));

    execFileSync("node", [join(linked, "scripts/install-git-hooks.js")], { cwd: linked });
    assert.equal((await git(linked, ["config", "--get", "core.hooksPath"])).trim(), ".githooks");
    assert.equal((await git(main, ["config", "--get", "core.hooksPath"])).trim(), ".githooks");

    await writeHook(linked, "linked");
    await git(linked, ["commit", "--allow-empty", "-m", "from linked"]);
    assert.equal((await readFile(join(linked, "hook.out"), "utf8")).trim(), "linked");
    assert.equal((await readFile(join(main, "hook.out"), "utf8")).trim(), "main");
  });
});

async function initHookRepo(repo: string, token: string): Promise<void> {
  await mkdir(join(repo, "scripts"), { recursive: true });
  await git(repo, ["init", "-b", "main"]);
  await git(repo, ["config", "user.email", "comprehende@example.com"]);
  await git(repo, ["config", "user.name", "Comprehende Fixture"]);
  await git(repo, ["config", "commit.gpgsign", "false"]);
  await cp(join(findPackageRoot(), "scripts/install-git-hooks.js"), join(repo, "scripts/install-git-hooks.js"));
  await writeHook(repo, token);
  await git(repo, ["add", "."]);
  await git(repo, ["commit", "-m", "seed", "-n"]);
}

async function hooksDir(cwd: string): Promise<string> {
  const raw = (await git(cwd, ["rev-parse", "--git-path", "hooks"])).trim();
  return realpathSync(isAbsolute(raw) ? raw : resolve(cwd, raw));
}

async function writeHook(repo: string, token: string): Promise<void> {
  await mkdir(join(repo, ".githooks"), { recursive: true });
  const path = join(repo, ".githooks/pre-commit");
  await writeFile(
    path,
    `#!/bin/sh\nroot=$(git rev-parse --show-toplevel)\necho ${token} > "$root/hook.out"\n`,
    { mode: 0o755 },
  );
  await chmod(path, 0o755);
}
