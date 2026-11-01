import type { DiffFile, LiveHunk } from "../schema/types.ts";

/**
 * The file header, then each hunk with its old and new line numbers before the diff mark, so a
 * focus range or note copies numbers instead of counting from the `@@` header. Reads the raw hunk
 * text, so git's `\ No newline at end of file` marker stays.
 */
export function numberedPatch(file: DiffFile, hunks: readonly LiveHunk[]): string {
  if (hunks.every((hunk) => hunk.lines.length === 0)) {
    return file.patch;
  }
  const width = String(
    Math.max(
      ...hunks.map((hunk) =>
        Math.max(hunk.oldStart + hunk.oldLines - 1, hunk.newStart + hunk.newLines - 1),
      ),
    ),
  ).length;
  const cell = (n?: number): string => (n === undefined ? "" : String(n)).padStart(width);
  const body = hunks.flatMap((hunk) => {
    const [header = hunk.header, ...raw] = hunk.patch.replace(/\n$/, "").split("\n");
    let oldNumber = hunk.oldStart;
    let newNumber = hunk.newStart;
    const numbered = raw.map((line) => {
      const mark = line[0];
      if (mark === "+") {
        return `${cell()} ${cell(newNumber++)} ${line}`;
      }
      if (mark === "-") {
        return `${cell(oldNumber++)} ${cell()} ${line}`;
      }
      if (mark === "\\") {
        return `${cell()} ${cell()} ${line}`;
      }
      return `${cell(oldNumber++)} ${cell(newNumber++)} ${line}`;
    });
    return [header, ...numbered];
  });
  return `${file.headerPatch}${body.join("\n")}\n`;
}
