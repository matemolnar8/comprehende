export function hunkContext(header: string): string | undefined {
  const match = /^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@\s*(.*)$/.exec(header);
  const ctx = match?.[1]?.trim();
  return ctx === undefined || ctx === "" ? undefined : ctx;
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

export function lineDelta(lines: { kind: "ctx" | "add" | "del" }[]): { added: number; removed: number } {
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
