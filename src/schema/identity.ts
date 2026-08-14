import type { HunkRef } from "./types.ts";

export function hunkKey(ref: Pick<HunkRef, "path" | "oldPath" | "oldStart" | "newStart">): string {
  const oldPath = ref.oldPath ?? "";
  return `${oldPath}\0${ref.path}\0${ref.oldStart}\0${ref.newStart}`;
}

export function sameHunk(a: HunkRef, b: HunkRef): boolean {
  return hunkKey(a) === hunkKey(b);
}
