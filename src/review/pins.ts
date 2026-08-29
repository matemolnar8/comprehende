import { fileExistsAt, showFile } from "../git/show.ts";
import { isLinePinned, textLineCount } from "../schema/source.ts";
import type { LinePinnedSource, ReviewDocument, SourceSide } from "../schema/types.ts";

export type StaleCommentPin = {
  id: string;
  path: string;
  side: SourceSide;
  line: number;
};

export async function staleCommentPins(
  cwd: string,
  document: ReviewDocument,
  range: { baseSha: string; headSha: string },
): Promise<StaleCommentPin[]> {
  const stale: StaleCommentPin[] = [];
  for (const source of document.sources ?? []) {
    if (!isLinePinned(source)) {
      continue;
    }
    if (!(await commentPinMatches(cwd, source, range))) {
      stale.push({ id: source.id, path: source.path, side: source.side, line: source.line });
    }
  }
  return stale;
}

export function commentPinErrors(pins: readonly StaleCommentPin[]): string[] {
  if (pins.length === 0) {
    return [];
  }
  const lines = pins.map((pin) => `  ${pin.id} ${pin.path} ${pin.side}:${pin.line}`);
  return [`stale: ${pins.length} comment pin(s) do not match live git:\n${lines.join("\n")}`];
}

async function commentPinMatches(
  cwd: string,
  source: LinePinnedSource,
  range: { baseSha: string; headSha: string },
): Promise<boolean> {
  const sha = source.side === "old" ? range.baseSha : range.headSha;
  if (!(await fileExistsAt(cwd, sha, source.path))) {
    return false;
  }
  const content = await showFile(cwd, sha, source.path);
  const count = textLineCount(content);
  return source.line >= 1 && source.line <= count;
}
