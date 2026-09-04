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

export type ReviewDocument = {
  version: 1;
  source: ReviewSource;
  /** Human review burden of this change, not file or hunk count. */
  size: ReviewSize;
  /** Short name of the whole change. Always present. */
  title: string;
  /** Short what of the whole change. Always present. */
  summary: string;
  /** Generated why for the whole change. From tickets, issues, a request description, or a transcript. Omit only when those sources are silent. */
  why?: string;
  sources?: Source[];
  groups: ReviewGroup[];
};

export type ReviewSource = {
  baseRef: string;
  headRef: string;
  range?: string;
};

export const SOURCE_KINDS = ["ticket", "pr", "pr-comment", "commit", "transcript"] as const;

export type SourceKind = (typeof SOURCE_KINDS)[number];

export function isSourceKind(value: unknown): value is SourceKind {
  return typeof value === "string" && (SOURCE_KINDS as readonly string[]).includes(value);
}

export type SourceSide = "old" | "new";

export function isSourceSide(value: unknown): value is SourceSide {
  return value === "old" || value === "new";
}

export type Source = {
  id: string;
  kind: SourceKind;
  label: string;
  url?: string;
  title?: string;
  /** One or two sentences: why this source matters. Written by the skill. */
  gist?: string;
  /** Independent story this source belongs to. Same name as that story's groups. */
  part?: string;
  /** pr-comment only. Copied at skill time. */
  author?: string;
  /** pr-comment only. The comment, faithful. */
  body?: string;
  /** pr-comment only. Git path at skill time. */
  path?: string;
  /** pr-comment only. Git-shaped, not GitHub-shaped. */
  side?: SourceSide;
  /** pr-comment only. 1-based line on that side. */
  line?: number;
};

export type LinePinnedSource = Source & {
  kind: "pr-comment";
  path: string;
  side: SourceSide;
  line: number;
};

export type ReviewGroup = {
  id: string;
  title: string;
  /** Generated why this group exists. From sources, or because later groups need it. */
  why: string;
  /** One sentence: what this group is. */
  summary: string;
  /** Scannable bullets of what to look at. Not a paragraph. */
  lookFor?: string[];
  /** Earlier group ids this one depends on. Same story only. Omit when independent. */
  dependsOn?: string[];
  /** Short name of the independent story this group belongs to. Same name = same story. */
  part?: string;
  /** Source ids this group names. Omit when none apply. */
  sources?: string[];
  suggestedOrder: number;
  hunkRefs: HunkRef[];
};

export type HunkRef = {
  path: string;
  oldPath?: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
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
