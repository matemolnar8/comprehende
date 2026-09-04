export function hunkRangeLabel(header: string): string {
  const match = /^(@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@)/.exec(header);
  return match?.[1] ?? header;
}

export function addedSymbols(addedLines: string[]): string[] {
  const names: string[] = [];
  const pattern = /^(?:export\s+)?(?:async\s+)?(?:function|class|type|interface|enum)\s+([A-Za-z_][\w]*)/;
  for (const line of addedLines) {
    const match = pattern.exec(line.trim());
    const name = match?.[1];
    if (name !== undefined && !names.includes(name)) {
      names.push(name);
    }
  }
  return names;
}

export type HunkLineKind = "ctx" | "add" | "del";

export function lineDelta(lines: { kind: HunkLineKind }[]): { added: number; removed: number } {
  let added = 0;
  let removed = 0;
  for (const line of lines) {
    if (line.kind === "add") {
      added += 1;
    } else if (line.kind === "del") {
      removed += 1;
    }
  }
  return { added, removed };
}
