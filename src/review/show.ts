import type { DiffFile, LiveHunk } from "../schema/types.ts";

const MARK = { ctx: " ", add: "+", del: "-" } as const;

/**
 * The file header, then each hunk with its old and new line numbers before the diff mark, so a
 * focus range or note copies numbers instead of counting from the `@@` header.
 */
export function numberedPatch(file: DiffFile, hunks: readonly LiveHunk[]): string {
  const lines = hunks.flatMap((hunk) => hunk.lines);
  if (lines.length === 0) {
    return file.patch;
  }
  const width = Math.max(
    ...lines.map((line) => String(Math.max(line.oldNumber ?? 0, line.newNumber ?? 0)).length),
  );
  const cell = (n: number | null): string => (n === null ? "" : String(n)).padStart(width);
  const body = hunks.flatMap((hunk) => [
    hunk.header,
    ...hunk.lines.map(
      (line) => `${cell(line.oldNumber)} ${cell(line.newNumber)} ${MARK[line.kind]}${line.text}`,
    ),
  ]);
  return `${file.headerPatch}${body.join("\n")}\n`;
}
