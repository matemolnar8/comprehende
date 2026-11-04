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
  return (
    file.kind === "text" && file.relocation !== undefined && file.added === 0 && file.removed === 0
  );
}

export type MovedMark = {
  side: "old" | "new";
  /** First line of the block. */
  line: number;
  /** Last line of the block. */
  end: number;
  /** The line the chip hangs under: the line before the block, else the block's first line. */
  anchor: number;
  peerPath: string;
  peerLine: number;
};

/** One mark per contiguous moved block. */
export function movedMarks(hunks: readonly { lines: readonly DiffLine[] }[]): MovedMark[] {
  const marks: MovedMark[] = [];
  for (const hunk of hunks) {
    let open: MovedMark | undefined;
    hunk.lines.forEach((line, index) => {
      const side = line.kind === "add" ? "new" : line.kind === "del" ? "old" : undefined;
      const lineNo = side === "new" ? line.newNumber : side === "old" ? line.oldNumber : null;
      if (line.moved === undefined || side === undefined || lineNo === null) {
        open = undefined;
        return;
      }
      if (
        open !== undefined &&
        open.side === side &&
        open.peerPath === line.moved.path &&
        lineNo === open.end + 1 &&
        line.moved.line === open.peerLine + (open.end - open.line) + 1
      ) {
        open.end = lineNo;
        return;
      }
      const before = hunk.lines[index - 1];
      const anchor =
        before === undefined ? null : side === "new" ? before.newNumber : before.oldNumber;
      open = {
        side,
        line: lineNo,
        end: lineNo,
        anchor: anchor ?? lineNo,
        peerPath: line.moved.path,
        peerLine: line.moved.line,
      };
      marks.push(open);
    });
  }
  return marks;
}

/** "Lines 2–6 moved to" and the peer path, which the chip sets in mono. A move inside the file names only the line. */
export type MovedLabel = { text: string; path?: string };

export function movedMarkLabel(filePath: string, mark: MovedMark): MovedLabel {
  const lines = mark.line === mark.end ? `Line ${mark.line}` : `Lines ${mark.line}–${mark.end}`;
  const text = `${lines} moved ${mark.side === "new" ? "from" : "to"}`;
  return mark.peerPath === filePath
    ? { text: `${text} line ${mark.peerLine}` }
    : { text, path: `${mark.peerPath}:${mark.peerLine}` };
}
