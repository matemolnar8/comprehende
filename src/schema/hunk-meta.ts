export function hunkRangeLabel(header: string): string {
  const match = /^(@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@)/.exec(header);
  return match?.[1] ?? header;
}

export function hunkContext(header: string): string | undefined {
  const match = /^@@ -\d+(?:,\d+)? \+\d+(?:,\d+)? @@\s*(.*)$/.exec(header);
  const ctx = match?.[1]?.trim();
  if (ctx === undefined || ctx === "") {
    return undefined;
  }
  return looksLikeCodeAnchor(ctx) ? ctx : undefined;
}

function looksLikeCodeAnchor(line: string): boolean {
  if (line.startsWith("#")) {
    return false;
  }
  const hasCodeToken = /[(){};=<>]|=>/.test(line) || /[a-zA-Z_][\w]*\(/.test(line);
  const hasKeyword =
    /\b(function|class|const|let|var|type|interface|enum|export|import|def|fn|async|return|struct|impl|pub)\b/.test(
      line,
    );
  if (/^[A-Z]/.test(line) && line.includes(": ") && !hasCodeToken && !hasKeyword) {
    return false;
  }
  if (/[.!?]$/.test(line) && !hasCodeToken) {
    return false;
  }
  return hasCodeToken || hasKeyword || /^[A-Za-z_][\w.]*$/.test(line);
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
