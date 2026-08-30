import type { DiffLine, FileStatus, HunkRef, ReviewDocument, SkippedFile } from "../schema/types.ts";

export type { FileStatus };

export type FileSide = "old" | "new";

export type FileKind = "text" | "image" | "lockfile";

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
  document: ReviewDocument;
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
  stale: { path: string; oldStart: number; newStart: number }[];
  staleSources: { id: string; path: string; side: "old" | "new"; line: number }[];
  files: {
    path: string;
    oldPath?: string;
    status: FileStatus;
    binary: boolean;
    image: boolean;
    hunkCount: number;
  }[];
  skipped: SkippedFile[];
  commits: ApiCommit[];
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
