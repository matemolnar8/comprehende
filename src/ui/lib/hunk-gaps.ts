import type { LiveHunk } from "../api.ts";
import type { FocusBlock, LineSpan } from "./focus.ts";

const HEADER = /^@@ -(\d+)(?:,\d+)? \+(\d+)/;

/**
 * New-side lines between two hunks shown in different blocks, so line numbers never jump with no
 * cue. The key is the block that starts the later hunk, and the row goes above it.
 */
export function hunkGaps(
  blocks: readonly FocusBlock[],
  hunks: readonly LiveHunk[],
): ReadonlyMap<string, LineSpan> {
  const hunkOf = (oldStart: number, newStart: number): number =>
    Math.max(
      0,
      hunks.findLastIndex((hunk) => hunk.newStart <= newStart && hunk.oldStart <= oldStart),
    );
  const gaps = new Map<string, LineSpan>();
  let last: number | undefined;
  for (const block of blocks) {
    const indexes =
      block.kind === "diff"
        ? block.patch.split("\n").flatMap((line) => {
            const match = HEADER.exec(line);
            return match === null ? [] : [hunkOf(Number(match[1]), Number(match[2]))];
          })
        : [block.hunk];
    const first = indexes[0];
    if (first === undefined) {
      continue;
    }
    if (last !== undefined && first > last) {
      const above = hunks[last];
      const below = hunks[first];
      if (above !== undefined && below !== undefined) {
        // An empty side names the line before it, as git writes it.
        const from = above.newLines === 0 ? above.newStart + 1 : above.newStart + above.newLines;
        const to = (below.newLines === 0 ? below.newStart + 1 : below.newStart) - 1;
        if (to >= from) {
          gaps.set(block.key, { from, to });
        }
      }
    }
    last = Math.max(last ?? first, ...indexes);
  }
  return gaps;
}

/** Digits of the largest line number on either side. */
export function gutterDigits(hunks: readonly LiveHunk[]): number {
  const last = hunks.reduce(
    (max, hunk) =>
      Math.max(max, hunk.oldStart + hunk.oldLines - 1, hunk.newStart + hunk.newLines - 1),
    1,
  );
  return String(last).length;
}
