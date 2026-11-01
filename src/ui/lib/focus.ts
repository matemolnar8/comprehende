import { focusAnchor, holdingHunk, noteAnchor, noteLetter } from "../../schema/anchor.ts";
import type { DiffLine, FocusRange, LineNote } from "../../schema/types.ts";
import type { LiveHunk } from "../api.ts";

/** A hunk that opens on its focus ranges. */
export type HunkFocus = {
  /** Index into the file's hunks. */
  hunk: number;
  ranges: FocusRange[];
  /** Indexes into the hunk's lines that the ranges show, ascending. */
  shown: number[];
  total: number;
};

export type LetteredNote = LineNote & { letter: string };

export function letterNotes(notes: readonly LineNote[]): LetteredNote[] {
  return notes.map((note, i) => ({ ...note, letter: noteLetter(i) }));
}

export function onFile(
  anchor: { path: string },
  file: { path: string; oldPath?: string },
): boolean {
  return anchor.path === file.path || anchor.path === file.oldPath;
}

/** One entry per hunk that holds a focus range. A range outside every hunk is ignored: git wins. */
export function fileFocus(hunks: readonly LiveHunk[], focus: readonly FocusRange[]): HunkFocus[] {
  const byHunk = new Map<number, HunkFocus>();
  for (const range of focus) {
    const holder = holdingHunk(hunks, focusAnchor(range));
    if (holder === undefined) {
      continue;
    }
    const index = hunks.indexOf(holder);
    const entry = byHunk.get(index) ?? {
      hunk: index,
      ranges: [],
      shown: [],
      total: holder.lines.length,
    };
    entry.ranges.push(range);
    entry.shown = [...new Set([...entry.shown, ...rangeLines(holder.lines, range)])].sort(
      (a, b) => a - b,
    );
    byHunk.set(index, entry);
  }
  return [...byHunk.values()].sort((a, b) => a.hunk - b.hunk);
}

/**
 * The lines a range names on its side. A change block cut at the range's edge widens to the whole
 * block when the cut-off part holds the other side: a range that starts on an added line also
 * shows the deletions that block replaces. A block of only additions stays cut.
 */
export function rangeLines(lines: readonly DiffLine[], range: FocusRange): number[] {
  const number = (line: DiffLine) => (range.side === "old" ? line.oldNumber : line.newNumber);
  const inside = lines.map((line) => {
    const n = number(line);
    return n !== null && n >= range.start && n <= range.end;
  });
  let first = inside.indexOf(true);
  let last = inside.lastIndexOf(true);
  if (first === -1) {
    return [];
  }
  const changed = (index: number) => {
    const kind = lines[index]?.kind;
    return kind !== undefined && kind !== "ctx";
  };
  const other = range.side === "old" ? "add" : "del";
  const pairs = (from: number, to: number) =>
    lines.slice(from, to + 1).some((line) => line.kind === other);
  let blockStart = first;
  while (changed(first) && changed(blockStart - 1)) blockStart -= 1;
  if (pairs(blockStart, first - 1)) {
    first = blockStart;
  }
  let blockEnd = last;
  while (changed(last) && changed(blockEnd + 1)) blockEnd += 1;
  if (pairs(last + 1, blockEnd)) {
    last = blockEnd;
  }
  return Array.from({ length: last - first + 1 }, (_, i) => first + i);
}

/** Notes in a focused hunk that its shown lines leave out. */
export function hiddenNotes(
  hunk: LiveHunk,
  focus: HunkFocus,
  notes: readonly LetteredNote[],
): LetteredNote[] {
  const shown = focus.shown.map((i) => hunk.lines[i]);
  return notes.filter(
    (note) =>
      holdingHunk([hunk], noteAnchor(note)) !== undefined &&
      !shown.some(
        (line) => (note.side === "old" ? line?.oldNumber : line?.newNumber) === note.line,
      ),
  );
}

/**
 * The file patch with each collapsed hunk cut down to its shown lines. Lines that stay hidden
 * between two ranges split the hunk in two. Returns the patch as is when its hunks do not line up
 * with `hunks`.
 */
export function focusPatch(
  patch: string,
  hunks: readonly LiveHunk[],
  collapsed: readonly HunkFocus[],
): string {
  if (collapsed.length === 0) {
    return patch;
  }
  const lines = patch.split("\n");
  const starts = lines.flatMap((line, i) => (line.startsWith("@@ ") ? [i] : []));
  if (starts.length !== hunks.length || starts[0] === undefined) {
    return patch;
  }
  const out = lines.slice(0, starts[0]);
  starts.forEach((start, i) => {
    const hunk = hunks[i];
    const focus = collapsed.find((item) => item.hunk === i);
    if (hunk === undefined || focus === undefined) {
      out.push(...lines.slice(start, starts[i + 1] ?? lines.length));
      return;
    }
    for (const run of runs(focus.shown)) {
      out.push(...subHunk(hunk, run));
    }
  });
  const text = out.join("\n");
  return patch.endsWith("\n") && !text.endsWith("\n") ? `${text}\n` : text;
}

function runs(indexes: readonly number[]): number[][] {
  const out: number[][] = [];
  for (const index of indexes) {
    const run = out.at(-1);
    if (run !== undefined && run.at(-1) === index - 1) {
      run.push(index);
    } else {
      out.push([index]);
    }
  }
  return out;
}

const MARK = { ctx: " ", add: "+", del: "-" } as const;

function subHunk(hunk: LiveHunk, run: readonly number[]): string[] {
  const first = run[0] ?? 0;
  const before = hunk.lines.slice(0, first);
  const picked = run.flatMap((i) => hunk.lines[i] ?? []);
  const count = (list: readonly DiffLine[], side: "oldNumber" | "newNumber") =>
    list.filter((line) => line[side] !== null).length;
  // An empty side starts on the line before the excerpt, as git writes it. A hunk that is empty on
  // that side already names that line.
  const start = (hunkStart: number, hunkLines: number, side: "oldNumber" | "newNumber") => {
    const at = hunkStart + count(before, side);
    return count(picked, side) === 0 && hunkLines > 0 ? at - 1 : at;
  };
  const header = `@@ -${start(hunk.oldStart, hunk.oldLines, "oldNumber")},${count(picked, "oldNumber")} +${start(hunk.newStart, hunk.newLines, "newNumber")},${count(picked, "newNumber")} @@`;
  return [header, ...picked.map((line) => `${MARK[line.kind]}${line.text}`)];
}
