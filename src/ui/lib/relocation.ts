import { basename } from "../../schema/types.ts";
import type { Relocation } from "../../schema/types.ts";
import type { DiffLine } from "../../schema/types.ts";

export type RelocationWord = "Copied" | "Moved" | "Renamed";

export function relocationWord(file: {
  path: string;
  oldPath?: string;
  relocation?: Relocation;
}): RelocationWord | undefined {
  const relocation = file.relocation;
  if (relocation === undefined) {
    return undefined;
  }
  if (relocation.kind === "copy") {
    return "Copied";
  }
  const oldPath = file.oldPath;
  if (oldPath !== undefined && oldPath !== file.path && basename(oldPath) === basename(file.path)) {
    return "Moved";
  }
  return "Renamed";
}

/** A rename or copy with no added or removed lines. The header is the whole change. */
export function isPureRelocation(file: {
  kind: string;
  added: number;
  removed: number;
  relocation?: Relocation;
}): boolean {
  return file.kind === "text" && file.relocation !== undefined && file.added === 0 && file.removed === 0;
}

export type MovedMark = {
  side: "old" | "new";
  line: number;
  peerPath: string;
  peerLine: number;
};

/** First line of each contiguous moved block. */
export function movedMarks(hunks: readonly { lines: readonly DiffLine[] }[]): MovedMark[] {
  const marks: MovedMark[] = [];
  let prev: MovedMark | undefined;
  for (const hunk of hunks) {
    for (const line of hunk.lines) {
      if (line.moved === undefined || (line.kind !== "add" && line.kind !== "del")) {
        prev = undefined;
        continue;
      }
      const side = line.kind === "add" ? "new" : "old";
      const lineNo = side === "new" ? line.newNumber : line.oldNumber;
      if (lineNo === null) {
        prev = undefined;
        continue;
      }
      const continues =
        prev !== undefined &&
        prev.side === side &&
        prev.peerPath === line.moved.path &&
        lineNo === prev.line + 1 &&
        line.moved.line === prev.peerLine + 1;
      const mark: MovedMark = { side, line: lineNo, peerPath: line.moved.path, peerLine: line.moved.line };
      if (!continues) {
        marks.push(mark);
      }
      prev = mark;
    }
  }
  return marks;
}

export function movedMarkLabel(filePath: string, mark: MovedMark): string {
  const where = mark.peerPath === filePath ? `line ${mark.peerLine}` : `${mark.peerPath}:${mark.peerLine}`;
  return mark.side === "new" ? `from ${where}` : `to ${where}`;
}
