import type { FocusRange, HunkRef, LineNote, SourceSide } from "./types.ts";

/** A focus range or a note: lines on one side of one file. */
export type LineAnchor = { path: string; side: SourceSide; start: number; end: number };

export type LineSpan = { start: number; end: number };

export function focusAnchor(range: FocusRange): LineAnchor {
  return { path: range.path, side: range.side, start: range.start, end: range.end };
}

export function noteAnchor(note: LineNote): LineAnchor {
  return { path: note.path, side: note.side, start: note.line, end: note.line };
}

/** Lines the hunk holds on one side, inclusive. Undefined when that side has none. */
export function hunkSpan(hunk: HunkRef, side: SourceSide): LineSpan | undefined {
  const start = side === "old" ? hunk.oldStart : hunk.newStart;
  const count = side === "old" ? hunk.oldLines : hunk.newLines;
  return count === 0 ? undefined : { start, end: start + count - 1 };
}

/** The hunk whose lines on the anchor's side hold the whole anchor. */
export function holdingHunk<Hunk extends HunkRef>(
  hunks: readonly Hunk[],
  anchor: LineAnchor,
): Hunk | undefined {
  return hunks.find((hunk) => {
    if (hunk.path !== anchor.path && hunk.oldPath !== anchor.path) {
      return false;
    }
    const span = hunkSpan(hunk, anchor.side);
    return span !== undefined && span.start <= anchor.start && anchor.end <= span.end;
  });
}

export function formatAnchor(anchor: LineAnchor): string {
  const lines = anchor.start === anchor.end ? `${anchor.start}` : `${anchor.start}-${anchor.end}`;
  return `${anchor.path} ${anchor.side}:${lines}`;
}

/** A, B, C: notes are lettered in the order the group lists them. */
export function noteLetter(index: number): string {
  return String.fromCharCode(65 + index);
}
