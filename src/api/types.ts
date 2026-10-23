import type {
  DiffLine,
  FileStatus,
  HunkRef,
  Relocation,
  ReviewHunkRef,
  SkippedFile,
  SourceSide,
  StoredReviewDocument,
} from "../schema/types.ts";

/** Single home for the git side union. SourceSide in schema is the same fact. */
export type FileSide = SourceSide;

export type FileKind = "text" | "image" | "lockfile";

/** Hunk group ids outside the review document. The UI fetches them with the same hunks endpoint. */
export const REVIEW_BUCKETS = {
  unassigned: "unassigned",
  lockfiles: "lockfiles",
} as const;

export type ReviewBucket = (typeof REVIEW_BUCKETS)[keyof typeof REVIEW_BUCKETS];

export type ApiHunk = HunkRef & {
  header: string;
  language: string;
  lines: DiffLine[];
};

export type ApiGroupFile = {
  path: string;
  oldPath?: string;
  kind: FileKind;
  status: FileStatus;
  patch: string;
  relocation?: Relocation;
  added?: number;
  removed?: number;
  /** False when this group holds only some of the file's live hunks. Pierre cannot hydrate those against the full blobs. */
  complete: boolean;
  hunks: ApiHunk[];
};

export type ApiHunks = {
  hunks: ApiHunk[];
  files: ApiGroupFile[];
};

export type ApiCommit = {
  sha: string;
  shortSha: string;
  subject: string;
  body: string;
  author: string;
  date: string;
};

export type ApiBlameLine = {
  sha: string;
  author: string;
  timestamp: number;
  line: number;
  text: string;
};

export type ApiReview = {
  /** The on-disk form, so it can be saved as a review.json again. */
  document: StoredReviewDocument;
  repo: {
    name: string;
    origin: string | null;
  };
  resolved: {
    baseRef: string;
    headRef: string;
    range: string;
    baseSha: string;
    headSha: string;
  };
  coverage: {
    totalHunks: number;
    assignedHunks: number;
    unassignedCount: number;
    staleCount: number;
    staleSourceCount: number;
  };
  groups: {
    id: string;
    title: string;
    why: string;
    summary: string;
    lookFor: string[];
    dependsOn: string[];
    part?: string;
    sources: string[];
    suggestedOrder: number;
    hunkCount: number;
    staleCount: number;
    files: string[];
  }[];
  unassigned: { hunkCount: number; files: string[] };
  lockfiles: { fileCount: number; files: string[] };
  stale: ReviewHunkRef[];
  staleSources: { id: string; path: string; side: FileSide; line: number }[];
  files: {
    path: string;
    oldPath?: string;
    relocation?: Relocation;
    status: FileStatus;
    binary: boolean;
    image: boolean;
    hunkCount: number;
  }[];
  skipped: SkippedFile[];
  commits: ApiCommit[];
  /** Set when the document names the review it was refreshed from. */
  changes?: ApiChanges;
};

export type ApiTextChange = { before: string; after: string };

export type ApiTextChanges = {
  title?: ApiTextChange;
  summary?: ApiTextChange;
  why?: ApiTextChange;
};

export type ApiListChange = { added: string[]; removed: string[] };

/** Live hunks, counted the way refresh tags them. */
export type ApiHunkCounts = { new: number; changed: number; reformat: number };

export type ApiGroupChange = {
  id: string;
  state: "added" | "removed" | "kept";
  title: string;
  text: ApiTextChanges;
  lookFor: ApiListChange;
  files: ApiListChange;
  /** Missing when git no longer has the previous commits. */
  hunks?: ApiHunkCounts;
};

/** What the review says now that it did not say before. Interpretation only; live git stays the how. */
export type ApiChanges = {
  since: { baseSha?: string; headSha?: string };
  text: ApiTextChanges;
  lookFor: ApiListChange;
  /** Source labels. */
  sources: ApiListChange;
  /** Groups that changed, in reading order; removed groups last. */
  groups: ApiGroupChange[];
  /** Missing when git no longer has the previous commits. */
  hunks?: ApiHunkCounts & { gone: number };
};

export type ApiFile = {
  path: string;
  ref: string;
  side: FileSide;
  content: string;
  language: string;
};

export type ApiBlame = {
  path: string;
  ref: string;
  side: FileSide;
  lines: ApiBlameLine[];
};
