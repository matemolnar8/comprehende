import { git, gitOk } from "./exec.ts";

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

export function assertSafePath(path: string): void {
  if (path.trim() === "" || path.startsWith("/") || path.includes("\0") || path.split("/").includes("..")) {
    throw new Error(`invalid path: ${path}`);
  }
}
