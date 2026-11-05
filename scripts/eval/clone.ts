import { mkdir, mkdtemp, readFile, rename, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { pathToFileURL } from "node:url";
import { git, gitOk } from "../../src/git/exec.ts";
import { parseGithubRepo } from "../pages-review.ts";
import { authedGitUrl, githubCacheName } from "./github.ts";

export function cachePath(cacheDir: string, repoUrl: string): string {
  const parsed = parseGithubRepo(repoUrl);
  if (parsed === undefined) {
    throw new Error(`not a GitHub repo URL: ${repoUrl}`);
  }
  return join(cacheDir, githubCacheName(parsed.owner, parsed.repo));
}

/** Clone into a temp dir and rename it into place, so a killed clone never looks complete. */
export async function ensureBareClone(opts: {
  cacheDir: string;
  repoUrl: string;
  localMirror?: string;
}): Promise<string> {
  const dest = cachePath(opts.cacheDir, opts.repoUrl);
  if (existsSync(join(dest, "HEAD"))) {
    return dest;
  }
  const token = process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN;
  const remoteUrl = authedGitUrl(opts.repoUrl, token);
  await mkdir(opts.cacheDir, { recursive: true });
  const partial = `${dest}.partial-${process.pid}`;
  await rm(partial, { recursive: true, force: true });
  try {
    if (opts.localMirror !== undefined && existsSync(join(opts.localMirror, ".git"))) {
      await git(opts.cacheDir, ["clone", "--bare", opts.localMirror, partial]);
      const remotes = (await git(partial, ["remote"])).trim().split("\n");
      if (!remotes.includes("github")) {
        await git(partial, ["remote", "add", "github", remoteUrl]);
      }
    } else {
      await git(opts.cacheDir, ["clone", "--bare", remoteUrl, partial]);
    }
    await rm(dest, { recursive: true, force: true });
    await rename(partial, dest);
  } finally {
    await rm(partial, { recursive: true, force: true });
  }
  return dest;
}

/**
 * Give one case run its own bare clone. The shared cache entry is filled and fetched under a
 * lock, then hardlink-cloned, so parallel runs and sibling worktrees never fetch into it at once.
 */
export async function cloneCaseFromCache(opts: {
  cacheDir: string;
  repoUrl: string;
  localMirror?: string;
  pr: number;
  base: string;
  head: string;
  dest: string;
}): Promise<void> {
  await mkdir(opts.cacheDir, { recursive: true });
  const cached = cachePath(opts.cacheDir, opts.repoUrl);
  await withLock(`${cached}.lock`, async () => {
    await ensureBareClone(opts);
    await fetchCaseRefs(cached, opts.pr, opts.base, opts.head);
    await git(opts.cacheDir, ["clone", "--bare", "--quiet", cached, opts.dest]);
  });
  await git(opts.dest, ["remote", "set-url", "origin", opts.repoUrl]);
  // The cache keeps head and base under refs that a bare clone does not copy.
  await git(opts.dest, ["update-ref", "refs/eval/head", opts.head]);
  await git(opts.dest, ["update-ref", "refs/eval/base", opts.base]);
}

/** A cross-process lock: a directory that holds the owner's pid. A dead owner's lock is taken over. */
export async function withLock<T>(lockDir: string, fn: () => Promise<T>): Promise<T> {
  for (;;) {
    try {
      await mkdir(lockDir);
      break;
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "EEXIST")) {
        throw error;
      }
      if (await lockOwnerDead(lockDir)) {
        await rm(lockDir, { recursive: true, force: true });
      } else {
        await sleep(250);
      }
    }
  }
  try {
    await writeFile(join(lockDir, "pid"), String(process.pid));
    return await fn();
  } finally {
    await rm(lockDir, { recursive: true, force: true });
  }
}

async function lockOwnerDead(lockDir: string): Promise<boolean> {
  let pid: number;
  try {
    pid = Number(await readFile(join(lockDir, "pid"), "utf8"));
  } catch {
    // The owner made the dir and has not written its pid yet, or died before it could.
    const made = await stat(lockDir).catch(() => undefined);
    return made !== undefined && Date.now() - made.mtimeMs > 60_000;
  }
  try {
    process.kill(pid, 0);
    return false;
  } catch (error) {
    return error instanceof Error && "code" in error && error.code === "ESRCH";
  }
}

export async function fetchCaseRefs(
  bare: string,
  pr: number,
  base: string,
  head: string,
): Promise<void> {
  const remote = (await gitOk(bare, ["remote", "get-url", "github"])) ? "github" : "origin";
  await git(
    bare,
    [
      "fetch",
      "--prune",
      remote,
      `+refs/pull/${pr}/head:refs/eval/pr-${pr}`,
      "+refs/heads/main:refs/heads/main",
      "+refs/heads/master:refs/heads/master",
    ],
    { allowFail: true },
  );
  if (!(await gitOk(bare, ["cat-file", "-e", `${head}^{commit}`]))) {
    await git(bare, ["fetch", remote, head]);
  }
  if (!(await gitOk(bare, ["cat-file", "-e", `${base}^{commit}`]))) {
    await git(bare, ["fetch", remote, base]);
  }
  const missing = [];
  if (!(await gitOk(bare, ["cat-file", "-e", `${head}^{commit}`]))) {
    missing.push(`head ${head}`);
  }
  if (!(await gitOk(bare, ["cat-file", "-e", `${base}^{commit}`]))) {
    missing.push(`base ${base}`);
  }
  if (missing.length > 0) {
    throw new Error(`clone is missing ${missing.join(" and ")}`);
  }
}

export const CASE_BUNDLE = "repo.bundle";
const BUNDLE_BASE_REF = "refs/eval/base";
const BUNDLE_HEAD_REF = "refs/eval/head";

/** Bundle the base tree plus base..head so a run needs no remote. The history is cut at base. */
export async function writeCaseBundle(
  bare: string,
  base: string,
  head: string,
  dest: string,
): Promise<void> {
  if (!(await gitOk(bare, ["merge-base", "--is-ancestor", base, head]))) {
    throw new Error(
      `base ${base} is not an ancestor of head ${head}, so the history cannot be cut at base`,
    );
  }
  await git(bare, ["update-ref", BUNDLE_BASE_REF, base]);
  await git(bare, ["update-ref", BUNDLE_HEAD_REF, head]);
  const tmp = await mkdtemp(join(tmpdir(), "comprehende-bundle-"));
  try {
    const source = pathToFileURL(bare).href;
    await git(tmp, ["init", "--bare", "--quiet"]);
    await git(tmp, [
      "fetch",
      "--quiet",
      "--depth=1",
      source,
      `${BUNDLE_BASE_REF}:${BUNDLE_BASE_REF}`,
    ]);
    await git(tmp, [
      "fetch",
      "--quiet",
      `--shallow-exclude=${BUNDLE_BASE_REF}`,
      source,
      `${BUNDLE_HEAD_REF}:${BUNDLE_HEAD_REF}`,
    ]);
    await git(tmp, [
      "bundle",
      "create",
      "--quiet",
      resolve(dest),
      BUNDLE_BASE_REF,
      BUNDLE_HEAD_REF,
    ]);
  } finally {
    await rm(tmp, { recursive: true, force: true });
  }
}

/** A bundle carries no shallow list, so mark base as the boundary before fetching from it. */
export async function cloneCaseBundle(opts: {
  bundle: string;
  dest: string;
  base: string;
  repoUrl: string;
}): Promise<void> {
  await mkdir(opts.dest, { recursive: true });
  await git(opts.dest, ["init", "--bare", "--quiet"]);
  await writeFile(join(opts.dest, "shallow"), `${opts.base}\n`);
  await git(opts.dest, ["fetch", "--quiet", resolve(opts.bundle), "refs/eval/*:refs/eval/*"]);
  await git(opts.dest, ["remote", "add", "origin", opts.repoUrl]);
}

export async function addDetachedWorktree(bare: string, dest: string, head: string): Promise<void> {
  await git(bare, ["worktree", "prune"], { allowFail: true });
  await git(bare, ["worktree", "add", "--detach", dest, head]);
}

export async function thisRepoMirror(
  packageRoot: string,
  repoUrl: string,
): Promise<string | undefined> {
  const wanted = parseGithubRepo(repoUrl);
  if (wanted === undefined) {
    return undefined;
  }
  const origin = (
    await git(packageRoot, ["config", "--get", "remote.origin.url"], { allowFail: true })
  ).trim();
  const parsed = parseGithubRepo(origin);
  if (parsed === undefined || parsed.owner !== wanted.owner || parsed.repo !== wanted.repo) {
    return undefined;
  }
  return packageRoot;
}
