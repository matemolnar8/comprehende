export type InlineNode =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "em"; children: InlineNode[] }
  | { type: "strong"; children: InlineNode[] };

export function flattenInline(source: string): string {
  return source.replace(/\s+/g, " ").trim();
}

export function parseInline(source: string): InlineNode[] {
  const flat = flattenInline(source);
  if (flat === "") {
    return [];
  }
  return compact(parseNodes(flat, 0, null).nodes);
}

type Until = "**" | "*" | null;

function parseNodes(src: string, start: number, until: Until): { nodes: InlineNode[]; index: number } {
  const nodes: InlineNode[] = [];
  let text = "";
  let i = start;

  const flush = (): void => {
    if (text !== "") {
      nodes.push({ type: "text", value: text });
      text = "";
    }
  };

  while (i < src.length) {
    if (until !== null && src.startsWith(until, i)) {
      flush();
      return { nodes, index: i };
    }

    if (src[i] === "\\" && i + 1 < src.length) {
      const next = src[i + 1]!;
      if (next === "\\" || next === "`" || next === "*") {
        text += next;
        i += 2;
        continue;
      }
    }

    if (src[i] === "`") {
      const code = readCode(src, i);
      if (code !== null) {
        flush();
        if (code.value !== "") {
          nodes.push({ type: "code", value: code.value });
        }
        i = code.end;
        continue;
      }
    }

    if (src.startsWith("**", i)) {
      const inner = parseNodes(src, i + 2, "**");
      if (src.startsWith("**", inner.index)) {
        flush();
        const children = compact(inner.nodes);
        if (children.length > 0) {
          nodes.push({ type: "strong", children });
        }
        i = inner.index + 2;
        continue;
      }
    }

    if (src[i] === "*") {
      const inner = parseNodes(src, i + 1, "*");
      if (inner.index < src.length && src[inner.index] === "*") {
        flush();
        const children = compact(inner.nodes);
        if (children.length > 0) {
          nodes.push({ type: "em", children });
        }
        i = inner.index + 1;
        continue;
      }
    }

    text += src[i]!;
    i += 1;
  }

  flush();
  return { nodes, index: i };
}

function readCode(src: string, start: number): { value: string; end: number } | null {
  let n = 0;
  while (src[start + n] === "`") {
    n += 1;
  }
  if (n === 0) {
    return null;
  }
  let i = start + n;
  while (i < src.length) {
    if (src[i] !== "`") {
      i += 1;
      continue;
    }
    let m = 0;
    while (src[i + m] === "`") {
      m += 1;
    }
    if (m === n) {
      return { value: trimCodeSpan(src.slice(start + n, i)), end: i + n };
    }
    i += m;
  }
  return null;
}

function trimCodeSpan(value: string): string {
  if (value.length >= 2 && value.startsWith(" ") && value.endsWith(" ")) {
    return value.slice(1, -1);
  }
  return value;
}

function compact(nodes: InlineNode[]): InlineNode[] {
  const out: InlineNode[] = [];
  for (const node of nodes) {
    if (node.type === "text" && node.value === "") {
      continue;
    }
    const last = out.at(-1);
    if (node.type === "text" && last?.type === "text") {
      out[out.length - 1] = { type: "text", value: last.value + node.value };
      continue;
    }
    out.push(node);
  }
  return out;
}
