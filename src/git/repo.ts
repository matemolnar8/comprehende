import { basename as nodeBasename, dirname, isAbsolute, resolve } from "node:path";
import { assertSafePath, isSafePath } from "../api/paths.ts";
import { basename as posixBasename } from "../schema/types.ts";
import { git, gitOk } from "./exec.ts";

export { assertSafePath, isSafePath };

export async function assertWorkTree(cwd: string): Promise<void> {
  const inside = await git(cwd, ["rev-parse", "--is-inside-work-tree"], { allowFail: true });
  if (inside.trim() !== "true") {
    throw new Error("cwd is not a git work tree. Run comprehende inside the repository under review.");
  }
}

export async function resolveCommit(cwd: string, ref: string): Promise<string> {
  assertSafeRef(ref);
  const sha = await git(cwd, ["rev-parse", "--verify", "--end-of-options", `${ref}^{commit}`]);
  return sha.trim();
}

export async function mergeBase(cwd: string, baseRef: string, headRef: string): Promise<string> {
  const sha = await git(cwd, ["merge-base", baseRef, headRef]);
  return sha.trim();
}

export type PinnedRange = {
  baseRef: string;
  headRef: string;
  baseSha: string;
  headSha: string;
  mergeBaseSha: string;
};

export type RepoIdentity = {
  name: string;
  origin: string | null;
};

/** Last path segment of a git remote URL, without .git. */
export function nameFromRemoteUrl(url: string): string | null {
  let value = url.trim();
  if (value === "") {
    return null;
  }
  value = value.replace(/\.git$/i, "").replace(/\/+$/, "");
  const pathPart = value.includes("://")
    ? value.replace(/^[^:]+:\/\/[^/]+\//, "")
    : value.includes(":")
      ? value.slice(value.lastIndexOf(":") + 1)
      : value;
  const last = posixBasename(pathPart);
  return last === "" ? null : last;
}

export async function gitCommonDir(cwd: string): Promise<string> {
  const raw = (await git(cwd, ["rev-parse", "--path-format=absolute", "--git-common-dir"])).trim();
  return isAbsolute(raw) ? raw : resolve(cwd, raw);
}

export async function readRepoIdentity(cwd: string): Promise<RepoIdentity> {
  const originText = (await git(cwd, ["config", "--get", "remote.origin.url"], { allowFail: true })).trim();
  const origin = originText === "" ? null : stripRemoteCredentials(originText);
  const fromOrigin = origin !== null ? nameFromRemoteUrl(origin) : null;
  if (fromOrigin !== null) {
    return { name: fromOrigin, origin };
  }
  return { name: nodeBasename(dirname(await gitCommonDir(cwd))), origin };
}

/** Drop userinfo from an http(s) remote so a copied prompt never carries a token. */
export function stripRemoteCredentials(url: string): string {
  const trimmed = url.trim();
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(trimmed)) {
    return trimmed;
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.username === "" && parsed.password === "") {
      return trimmed;
    }
    parsed.username = "";
    parsed.password = "";
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return trimmed;
  }
}

/** Resolve refs to commits once. Later checkout or branch motion does not move these SHAs. */
export async function pinRange(cwd: string, baseRef: string, headRef: string): Promise<PinnedRange> {
  const baseSha = await resolveCommit(cwd, baseRef);
  const headSha = await resolveCommit(cwd, headRef);
  const mergeBaseSha = await mergeBase(cwd, baseSha, headSha);
  return { baseRef, headRef, baseSha, headSha, mergeBaseSha };
}

export async function defaultBaseRef(cwd: string): Promise<string> {
  const remoteHead = await git(cwd, ["symbolic-ref", "--quiet", "refs/remotes/origin/HEAD"], { allowFail: true });
  const trimmed = remoteHead.trim();
  if (trimmed.startsWith("refs/remotes/")) {
    return trimmed.slice("refs/remotes/".length);
  }
  for (const candidate of ["main", "master", "trunk"]) {
    if (await gitOk(cwd, ["rev-parse", "--verify", "--end-of-options", `${candidate}^{commit}`])) {
      return candidate;
    }
  }
  throw new Error("could not detect a default base branch; pass --base <ref>");
}

export function rangeLabel(baseRef: string, headRef: string): string {
  return `${baseRef}...${headRef}`;
}

export function assertSafeRef(ref: string): void {
  if (ref.trim() === "") {
    throw new Error("git ref must be a non-empty string");
  }
  if (ref.startsWith("-") || ref.includes("\0")) {
    throw new Error(`invalid git ref: ${ref}`);
  }
}

export function resolveInsideRoot(root: string, relative: string): string {
  assertSafePath(relative);
  const rootAbs = resolve(root);
  const abs = resolve(root, relative);
  if (abs !== rootAbs && !abs.startsWith(`${rootAbs}/`)) {
    throw new Error(`invalid path: ${relative}`);
  }
  return abs;
}
