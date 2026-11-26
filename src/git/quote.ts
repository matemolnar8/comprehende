const C_ESCAPES: Record<string, number> = {
  a: 0x07,
  b: 0x08,
  t: 0x09,
  n: 0x0a,
  v: 0x0b,
  f: 0x0c,
  r: 0x0d,
  '"': 0x22,
  "\\": 0x5c,
};

const OCTAL_BYTE = /^[0-3][0-7]{2}/;
const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Reads the C-style quoted path that starts at `text[start]`, as git writes it for names with `"`,
 * a backslash, or control characters. Octal escapes are raw bytes, so `\303\251` is UTF-8 "é".
 */
export function readQuotedGitPath(
  text: string,
  start = 0,
): { path: string; end: number } | undefined {
  if (text[start] !== '"') {
    return undefined;
  }
  const bytes: number[] = [];
  let i = start + 1;
  while (i < text.length) {
    const char = String.fromCodePoint(text.codePointAt(i) ?? 0);
    if (char === '"') {
      return { path: decoder.decode(new Uint8Array(bytes)), end: i + 1 };
    }
    if (char !== "\\") {
      bytes.push(...encoder.encode(char));
      i += char.length;
      continue;
    }
    const octal = OCTAL_BYTE.exec(text.slice(i + 1, i + 4));
    if (octal) {
      bytes.push(Number.parseInt(octal[0], 8));
      i += 4;
      continue;
    }
    const escaped = C_ESCAPES[text[i + 1] ?? ""];
    if (escaped === undefined) {
      return undefined;
    }
    bytes.push(escaped);
    i += 2;
  }
  return undefined;
}

/** A path from a git diff header line: quoted as a whole, or as is. */
export function unquoteGitPath(raw: string): string {
  const quoted = readQuotedGitPath(raw);
  return quoted !== undefined && quoted.end === raw.length ? quoted.path : raw;
}
