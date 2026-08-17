export const REVIEW_SIZES = ["trivial", "small", "medium", "large", "very-large"] as const;

export type ReviewSize = (typeof REVIEW_SIZES)[number];

export function isReviewSize(value: unknown): value is ReviewSize {
  return typeof value === "string" && (REVIEW_SIZES as readonly string[]).includes(value);
}

export type ReviewDocument = {
  version: 1;
  source: ReviewSource;
  /** Human review burden of this change, not file or hunk count. */
  size: ReviewSize;
  walkthrough?: string;
  tickets?: Ticket[];
  groups: ReviewGroup[];
};

export type ReviewSource = {
  baseRef: string;
  headRef: string;
  range?: string;
};

export type Ticket = {
  id: string;
  url?: string;
  title?: string;
};

export type ReviewGroup = {
  id: string;
  title: string;
  /** One sentence: what this layer is and why it exists. */
  summary: string;
  /** Scannable bullets of what to look at. Not a paragraph. */
  lookFor?: string[];
  /** Earlier layer ids this one depends on. Same story only. Omit when independent. */
  dependsOn?: string[];
  /** Short name of the independent story this layer belongs to. Same name = same story. */
  part?: string;
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
  reason: "binary";
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
  headerPatch: string;
  patch: string;
  hunks: LiveHunk[];
};
