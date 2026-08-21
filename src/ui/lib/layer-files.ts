import { lineDelta } from "../../schema/hunk-meta.ts";
import type { FileKind, FileStatus, LiveHunk } from "../api.ts";

export type LayerFile = {
  path: string;
  oldPath?: string;
  kind: FileKind;
  status: FileStatus;
  patch: string;
  added: number;
  removed: number;
  hunkCount: number;
  firstIndex: number;
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
    hunks: LiveHunk[];
  }[],
): LayerFile[] {
  let firstIndex = 0;
  return files.map((file) => {
    const delta = lineDelta(file.hunks.flatMap((hunk) => hunk.lines));
    const layer: LayerFile = {
      path: file.path,
      kind: file.kind ?? "text",
      status: file.status ?? "modified",
      patch: file.patch,
      added: file.added ?? delta.added,
      removed: file.removed ?? delta.removed,
      hunkCount: Math.max(file.hunks.length, 1),
      firstIndex,
      hunks: file.hunks,
    };
    if (file.oldPath !== undefined) {
      layer.oldPath = file.oldPath;
    }
    firstIndex += layer.hunkCount;
    return layer;
  });
}

export function fileIndexAtHunk(files: LayerFile[], hunkIndex: number): number {
  return files.findIndex((file) => hunkIndex >= file.firstIndex && hunkIndex < file.firstIndex + file.hunkCount);
}
