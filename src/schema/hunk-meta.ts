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

export type HunkLineKind = "ctx" | "add" | "del";

export type HunkLine = {
  kind: HunkLineKind;
  oldNumber: number | null;
  newNumber: number | null;
  text: string;
};

export type SplitSide = {
  kind: HunkLineKind;
  number: number | null;
  text: string;
};

export type SplitRow = {
  left: SplitSide | null;
  right: SplitSide | null;
};

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

export function splitDiffRows(lines: HunkLine[]): SplitRow[] {
  const rows: SplitRow[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (line === undefined) {
      break;
    }
    if (line.kind === "ctx") {
      rows.push({
        left: { kind: "ctx", number: line.oldNumber, text: line.text },
        right: { kind: "ctx", number: line.newNumber, text: line.text },
      });
      index += 1;
      continue;
    }
    if (line.kind === "del") {
      const removed: HunkLine[] = [];
      while (index < lines.length && lines[index]?.kind === "del") {
        const next = lines[index];
        if (next !== undefined) {
          removed.push(next);
        }
        index += 1;
      }
      const added: HunkLine[] = [];
      while (index < lines.length && lines[index]?.kind === "add") {
        const next = lines[index];
        if (next !== undefined) {
          added.push(next);
        }
        index += 1;
      }
      const count = Math.max(removed.length, added.length);
      for (let offset = 0; offset < count; offset += 1) {
        const leftLine = removed[offset];
        const rightLine = added[offset];
        rows.push({
          left:
            leftLine === undefined
              ? null
              : { kind: leftLine.kind, number: leftLine.oldNumber, text: leftLine.text },
          right:
            rightLine === undefined
              ? null
              : { kind: rightLine.kind, number: rightLine.newNumber, text: rightLine.text },
        });
      }
      continue;
    }
    rows.push({
      left: null,
      right: { kind: "add", number: line.newNumber, text: line.text },
    });
    index += 1;
  }
  return rows;
}
