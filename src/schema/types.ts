import type { HunkRef, ReviewSource, Source } from "./review.ts";

export type { HunkRef, ReviewDocument, ReviewGroup, ReviewSource, Source } from "./review.ts";

export const REVIEW_SIZES = ["trivial", "small", "medium", "large", "very-large"] as const;

export type ReviewSize = (typeof REVIEW_SIZES)[number];

export function isReviewSize(value: unknown): value is ReviewSize {
  return typeof value === "string" && (REVIEW_SIZES as readonly string[]).includes(value);
}

export function padIndex(index: number): string {
  return String(index).padStart(2, "0");
}

export function sizeLabel(size: ReviewSize): string {
  return size.replace("-", " ");
}

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

/** Last slash segment of a git path. Git paths use forward slashes. */
export function basename(path: string): string {
  const slash = path.lastIndexOf("/");
  return slash === -1 ? path : path.slice(slash + 1);
}

export const SOURCE_KINDS = ["ticket", "pr", "pr-comment", "commit", "transcript"] as const;

export type SourceKind = (typeof SOURCE_KINDS)[number];

export function isSourceKind(value: unknown): value is SourceKind {
  return typeof value === "string" && (SOURCE_KINDS as readonly string[]).includes(value);
}

export type SourceSide = "old" | "new";

export function isSourceSide(value: unknown): value is SourceSide {
  return value === "old" || value === "new";
}

export type LinePinnedSource = Source & {
  kind: "pr-comment";
  path: string;
  side: SourceSide;
  line: number;
};

export type HunkIndex = {
  source: ReviewSource;
  hunks: HunkRef[];
  skipped: SkippedFile[];
};

export type SkippedFile = {
  path: string;
  reason: "binary" | "lockfile";
};

export type DiffLineKind = "ctx" | "add" | "del";

export type DiffLine = {
  kind: DiffLineKind;
  oldNumber: number | null;
  newNumber: number | null;
  text: string;
};

export type LiveHunk = HunkRef & {
  header: string;
  lines: DiffLine[];
  patch: string;
};

export type FileStatus = "added" | "deleted" | "modified" | "renamed";

export type DiffFile = {
  path: string;
  oldPath?: string;
  status: FileStatus;
  binary: boolean;
  image: boolean;
  headerPatch: string;
  patch: string;
  hunks: LiveHunk[];
  /** Present on lockfile stubs that never loaded patch text. */
  added?: number;
  removed?: number;
};
