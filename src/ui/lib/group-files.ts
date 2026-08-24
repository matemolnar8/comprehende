import { lineDelta } from "../../schema/hunk-meta.ts";
import type { FileKind, FileStatus, LiveHunk } from "../api.ts";

export type GroupFile = {
  path: string;
  oldPath?: string;
  kind: FileKind;
  status: FileStatus;
  patch: string;
  added: number;
  removed: number;
  hunkCount: number;
  firstIndex: number;
  complete: boolean;
  hunks: LiveHunk[];
};

export function filesFromPayload(
  files: {
    path: string;
    oldPath?: string;
    kind?: FileKind;
    status?: FileStatus;
    patch: string;
    added?: number;
    removed?: number;
    complete?: boolean;
    hunks: LiveHunk[];
  }[],
): GroupFile[] {
  let firstIndex = 0;
  return files.map((file) => {
    const delta = lineDelta(file.hunks.flatMap((hunk) => hunk.lines));
    const next: GroupFile = {
      path: file.path,
      kind: file.kind ?? "text",
      status: file.status ?? "modified",
      patch: file.patch,
      added: file.added ?? delta.added,
      removed: file.removed ?? delta.removed,
      hunkCount: Math.max(file.hunks.length, 1),
      firstIndex,
      complete: file.complete !== false,
      hunks: file.hunks,
    };
    if (file.oldPath !== undefined) {
      next.oldPath = file.oldPath;
    }
    firstIndex += next.hunkCount;
    return next;
  });
}

export function fileIndexAtHunk(files: GroupFile[], hunkIndex: number): number {
  return files.findIndex((file) => hunkIndex >= file.firstIndex && hunkIndex < file.firstIndex + file.hunkCount);
}
