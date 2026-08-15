import { lineDelta } from "../../schema/hunk-meta.ts";
import type { LiveHunk } from "../api.ts";

export type LayerFile = {
  path: string;
  oldPath?: string;
  patch: string;
  added: number;
  removed: number;
  hunkCount: number;
  firstIndex: number;
  hunks: LiveHunk[];
};

export function filesFromHunks(hunks: LiveHunk[], patches: Map<string, string>): LayerFile[] {
  const map = new Map<string, LayerFile>();
  hunks.forEach((hunk, index) => {
    const delta = lineDelta(hunk.lines);
    const existing = map.get(hunk.path);
    if (existing === undefined) {
      map.set(hunk.path, {
        path: hunk.path,
        oldPath: hunk.oldPath,
        patch: patches.get(hunk.path) ?? "",
        added: delta.added,
        removed: delta.removed,
        hunkCount: 1,
        firstIndex: index,
        hunks: [hunk],
      });
      return;
    }
    existing.added += delta.added;
    existing.removed += delta.removed;
    existing.hunkCount += 1;
    existing.hunks.push(hunk);
  });
  return [...map.values()];
}

export function fileIndexAtHunk(files: LayerFile[], hunkIndex: number): number {
  return files.findIndex(
    (file) => hunkIndex >= file.firstIndex && hunkIndex < file.firstIndex + file.hunkCount,
  );
}
