import type { HunkRef } from "./types.ts";

const COMPACT_SUFFIX = /@(\d+)\+(\d+)$/;
const RENAME_MARK = " -> ";

/** Every live hunk of `path`. */
export type FileHunkRef = {
  path: string;
};

/** One hunk. Line counts are present only when the object form supplied them. */
export type LocatedHunkRef = {
  path: string;
  oldPath?: string;
  oldStart: number;
  newStart: number;
  oldLines?: number;
  newLines?: number;
};

export type ReviewHunkRef = FileHunkRef | LocatedHunkRef;

export type ParsedHunkString =
  | { kind: "file"; path: string }
  | { kind: "hunk"; path: string; oldPath?: string; oldStart: number; newStart: number };

export function isLocatedHunkRef(ref: ReviewHunkRef): ref is LocatedHunkRef {
  return "oldStart" in ref;
}

export function hunkKey(ref: Pick<HunkRef, "path" | "oldPath" | "oldStart" | "newStart">): string {
  const oldPath = ref.oldPath ?? "";
  return `${oldPath}\0${ref.path}\0${ref.oldStart}\0${ref.newStart}`;
}

export function formatHunkRef(ref: HunkRef): string {
  const rename = ref.oldPath !== undefined ? `${ref.oldPath} -> ` : "";
  return `${rename}${ref.path} @@ -${ref.oldStart},${ref.oldLines} +${ref.newStart},${ref.newLines} @@`;
}

/** Path string, or `path@oldStart+newStart`, or `old -> new@oldStart+newStart`. */
export function parseHunkRefString(value: string): ParsedHunkString | undefined {
  const text = value.trim();
  if (text === "") {
    return undefined;
  }
  const suffix = COMPACT_SUFFIX.exec(text);
  if (suffix === null) {
    return { kind: "file", path: text };
  }
  const oldStart = Number(suffix[1]);
  const newStart = Number(suffix[2]);
  if (!Number.isSafeInteger(oldStart) || !Number.isSafeInteger(newStart)) {
    return undefined;
  }
  const head = text.slice(0, suffix.index);
  const arrow = head.lastIndexOf(RENAME_MARK);
  if (arrow === -1) {
    if (head === "") {
      return undefined;
    }
    return { kind: "hunk", path: head, oldStart, newStart };
  }
  const oldPath = head.slice(0, arrow);
  const path = head.slice(arrow + RENAME_MARK.length);
  if (oldPath === "" || path === "") {
    return undefined;
  }
  return { kind: "hunk", path, oldPath, oldStart, newStart };
}

export function formatStoredHunkRef(ref: ReviewHunkRef): string {
  if (!isLocatedHunkRef(ref)) {
    return ref.path;
  }
  if (ref.oldLines !== undefined && ref.newLines !== undefined) {
    return formatHunkRef({
      path: ref.path,
      ...(ref.oldPath !== undefined ? { oldPath: ref.oldPath } : {}),
      oldStart: ref.oldStart,
      oldLines: ref.oldLines,
      newStart: ref.newStart,
      newLines: ref.newLines,
    });
  }
  const rename = ref.oldPath !== undefined ? `${ref.oldPath} -> ` : "";
  return `${rename}${ref.path}@${ref.oldStart}+${ref.newStart}`;
}
