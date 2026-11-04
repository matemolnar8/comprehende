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
    const entry = byHunk.get(index) ?? { hunk: index, ranges: [], shown: [] };
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

/** What a file with focus ranges renders, top to bottom. */
export type FocusBlock =
  | { kind: "bar"; key: string; hunk: number; focus: HunkFocus; whole: boolean }
  | { kind: "diff"; key: string; patch: string }
  | { kind: "hidden"; key: string; hunk: number; count: number; notes: LetteredNote[] };

type BarBlock = Extract<FocusBlock, { kind: "bar" }>;

export type LineSpan = { from: number; to: number };

const barKey = (hunk: number) => `bar-${hunk}`;
const hiddenPrefix = (hunk: number) => `hidden-${hunk}-`;
const hiddenKey = (hunk: number, from: number) => `${hiddenPrefix(hunk)}${from}`;

/**
 * One diff per focused hunk, so each focus bar sits on its hunk. A cut hunk shows its ranges, with
 * a hidden-lines row at each cut edge that names the notes it hides. `open` holds the keys of the
 * bars and hidden rows the reader opened: a bar opens its whole hunk, a row opens only its own
 * lines. Undefined when no hunk has a range, or when the patch's `@@` lines do not line up with
 * `hunks`: the file then renders whole.
 */
export function focusBlocks(
  patch: string,
  hunks: readonly LiveHunk[],
  focus: readonly HunkFocus[],
  open: ReadonlySet<string>,
  notes: readonly LetteredNote[],
): FocusBlock[] | undefined {
  const lines = patch.replace(/\n$/, "").split("\n");
  const starts = lines.flatMap((line, i) => (line.startsWith("@@ ") ? [i] : []));
  if (focus.length === 0 || starts.length !== hunks.length || starts[0] === undefined) {
    return undefined;
  }
  const header = lines.slice(0, starts[0]);
  const diff = (key: string, body: readonly string[]): FocusBlock => ({
    kind: "diff",
    key,
    patch: `${[...header, ...body].join("\n")}\n`,
  });
  const blocks: FocusBlock[] = [];
  // Hunks with no range read together as one diff, as they do in a file with no focus.
  let plain: string[] = [];
  const flush = (i: number) => {
    if (plain.length > 0) {
      blocks.push(diff(`plain-${i}`, plain));
      plain = [];
    }
  };
  hunks.forEach((hunk, i) => {
    const chunk = lines.slice(starts[i], starts[i + 1] ?? lines.length);
    const entry = focus.find((item) => item.hunk === i);
    if (entry === undefined) {
      plain.push(...chunk);
      return;
    }
    flush(i);
    const cuts = parts(entry.shown, hunk.lines.length).flatMap((part) =>
      part.kind === "cut" ? [part.span] : [],
    );
    const opened = cuts.filter((cut) => open.has(hiddenKey(i, cut.from)));
    const shown = [
      ...entry.shown,
      ...opened.flatMap(({ from, to }) =>
        Array.from({ length: to - from + 1 }, (_, k) => from + k),
      ),
    ].sort((a, b) => a - b);
    const isWhole = open.has(barKey(i)) || (opened.length > 0 && opened.length === cuts.length);
    blocks.push({ kind: "bar", key: barKey(i), hunk: i, focus: entry, whole: isWhole });
    if (isWhole) {
      blocks.push(diff(`hunk-${i}`, chunk));
      return;
    }
    for (const part of parts(shown, hunk.lines.length)) {
      if (part.kind === "run") {
        blocks.push(diff(`cut-${i}-${part.run[0] ?? 0}`, subHunk(hunk, part.run)));
        continue;
      }
      const cutLines = hunk.lines.slice(part.span.from, part.span.to + 1);
      blocks.push({
        kind: "hidden",
        key: hiddenKey(i, part.span.from),
        hunk: i,
        count: cutLines.length,
        notes: notes.filter(
          (note) =>
            onHunk(note, hunk) &&
            cutLines.some(
              (line) => (note.side === "old" ? line.oldNumber : line.newNumber) === note.line,
            ),
        ),
      });
    }
  });
  flush(hunks.length);
  return blocks;
}

/** The open set after a bar's toggle: it opens the whole hunk, or closes the hunk and its rows. */
export function toggleHunk(open: ReadonlySet<string>, bar: BarBlock): ReadonlySet<string> {
  if (!bar.whole) {
    return new Set([...open, bar.key]);
  }
  const rows = hiddenPrefix(bar.hunk);
  return new Set([...open].filter((key) => key !== bar.key && !key.startsWith(rows)));
}

type Part = { kind: "run"; run: number[] } | { kind: "cut"; span: LineSpan };

/** A hunk's lines in order: the runs `shown` holds, and the index spans it leaves out. */
function parts(shown: readonly number[], length: number): Part[] {
  const out: Part[] = [];
  let next = 0;
  for (const run of runs(shown)) {
    const first = run[0] ?? next;
    if (first > next) {
      out.push({ kind: "cut", span: { from: next, to: first - 1 } });
    }
    out.push({ kind: "run", run });
    next = (run.at(-1) ?? first) + 1;
  }
  if (next < length) {
    out.push({ kind: "cut", span: { from: next, to: length - 1 } });
  }
  return out;
}

function onHunk(note: LineNote, hunk: LiveHunk): boolean {
  return holdingHunk([hunk], noteAnchor(note)) !== undefined;
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
