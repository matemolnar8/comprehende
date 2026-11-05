import { basename, dirname, join, resolve } from "node:path";
import { git } from "../../src/git/exec.ts";

/** The git dir that the main checkout and all its worktrees share. Undefined outside git. */
async function gitCommonDir(packageRoot: string): Promise<string | undefined> {
  const out = (
    await git(packageRoot, ["rev-parse", "--git-common-dir"], { allowFail: true })
  ).trim();
  return out === "" ? undefined : resolve(packageRoot, out);
}

/** Worktrees of one checkout share this cache, so a repo is cloned once per machine. */
export async function evalCacheDir(packageRoot: string): Promise<string> {
  const common = await gitCommonDir(packageRoot);
  if (common === undefined) {
    throw new Error(`${packageRoot} is not a git checkout`);
  }
  return join(common, "comprehende-eval-cache");
}

/** The checkout that owns the shared git dir. Undefined for a bare repo or outside git. */
export async function mainCheckoutDir(packageRoot: string): Promise<string | undefined> {
  const common = await gitCommonDir(packageRoot);
  return common !== undefined && basename(common) === ".git" ? dirname(common) : undefined;
}
