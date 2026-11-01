import {
  focusAnchor,
  formatAnchor,
  holdingHunk,
  hunkSpan,
  noteAnchor,
  type LineAnchor,
} from "../schema/anchor.ts";
import { hunkKey } from "../schema/identity.ts";
import type { FocusRange, LineNote, LiveHunk, ReviewGroup, SourceSide } from "../schema/types.ts";
import type { ReviewCoverage } from "./coverage.ts";

/** One error that lists every focus range and note outside the live hunks of its group. */
export function anchorErrors(coverage: ReviewCoverage): string[] {
  const lines: string[] = [];
  for (const { group, hunks } of coverage.groups) {
    const check = (where: string, anchor: LineAnchor): void => {
      if (holdingHunk(hunks, anchor) === undefined) {
        lines.push(`  ${group.id} ${where} ${formatAnchor(anchor)} · ${liveSpans(hunks, anchor)}`);
      }
    };
    (group.focus ?? []).forEach((range, i) => check(`focus[${i}]`, focusAnchor(range)));
    (group.notes ?? []).forEach((note, i) => check(`notes[${i}]`, noteAnchor(note)));
  }
  if (lines.length === 0) {
    return [];
  }
  return [
    `anchor: ${lines.length} focus range(s) or note(s) do not sit inside one live hunk of their group. Copy line numbers from show:\n${lines.join("\n")}`,
  ];
}

function liveSpans(hunks: readonly LiveHunk[], anchor: LineAnchor): string {
  const spans = hunks
    .filter((hunk) => hunk.path === anchor.path || hunk.oldPath === anchor.path)
    .map((hunk) => hunkSpan(hunk, anchor.side))
    .filter((span) => span !== undefined)
    .map((span) => `${span.start}-${span.end}`);
  return spans.length === 0
    ? "this group has no hunk on that side of that path"
    : `group hunks on ${anchor.side}: ${spans.join(", ")}`;
}

/** Where a previous hunk went: same changed lines, or edited in place. Undefined when gone. */
export type CarriedHunk = { next: LiveHunk; kind: "same" | "changed" | "reformat" } | undefined;

export type CarriedAnchors = {
  focus: FocusRange[];
  notes: LineNote[];
  /** Ranges and notes dropped because their hunk was edited. */
  changed: { focus: number; notes: number };
};

/**
 * Ranges and notes follow their hunk: a `same` hunk shifts them, an edited one drops them, and
 * so does a hunk that left the diff. A shift onto context the `same` hunk no longer shows drops
 * the anchor too, and counts it with the edited ones.
 */
export function carryAnchors(
  group: Pick<ReviewGroup, "focus" | "notes">,
  previous: readonly LiveHunk[],
  carried: ReadonlyMap<string, CarriedHunk>,
): CarriedAnchors {
  const changed = { focus: 0, notes: 0 };
  const shiftOf = (anchor: LineAnchor, kind: keyof typeof changed): number | undefined => {
    const from = holdingHunk(previous, anchor);
    const to = from === undefined ? undefined : carried.get(hunkKey(from));
    if (from === undefined || to === undefined) {
      return undefined;
    }
    const by = changeStart(to.next, anchor.side) - changeStart(from, anchor.side);
    const moved = { ...anchor, start: anchor.start + by, end: anchor.end + by };
    if (to.kind !== "same" || holdingHunk([to.next], moved) === undefined) {
      changed[kind] += 1;
      return undefined;
    }
    return by;
  };
  const focus = (group.focus ?? []).flatMap((range) => {
    const by = shiftOf(focusAnchor(range), "focus");
    return by === undefined ? [] : [{ ...range, start: range.start + by, end: range.end + by }];
  });
  const notes = (group.notes ?? []).flatMap((note) => {
    const by = shiftOf(noteAnchor(note), "notes");
    return by === undefined ? [] : [{ ...note, line: note.line + by }];
  });
  return { focus, notes, changed };
}

/**
 * First changed line on one side. A `same` hunk can gain or lose leading context near the top of
 * a file, so its start line alone does not say how far its lines moved.
 */
function changeStart(hunk: LiveHunk, side: SourceSide): number {
  const line = hunk.lines.find((item) => item.kind === (side === "old" ? "del" : "add"));
  const number = side === "old" ? line?.oldNumber : line?.newNumber;
  return number ?? (side === "old" ? hunk.oldStart : hunk.newStart);
}
