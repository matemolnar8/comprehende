/** MDX holds JSX, which a Markdown parser reads as text. It stays a source diff. */
export function isMarkdownPath(path: string): boolean {
  return /\.(md|markdown|mdc)$/i.test(path);
}

/**
 * The highlighter language a code fence names. A fence names a file extension (`ts`) or a language
 * (`typescript`), so the lookup from extension to language answers both.
 */
export function fenceLanguage(
  info: string,
  lookup: Readonly<Record<string, string | undefined>>,
): string | undefined {
  const name = info.toLowerCase();
  return lookup[name] ?? (Object.values(lookup).includes(name) ? name : undefined);
}

const FENCE = /^[\s>*+\-\d.)]*(?:`{3,}|~{3,})[ \t]*([\w#+.-]+)/gm;

/**
 * The names on the code fences of a Markdown file, and `yaml` for its front matter. A line that
 * only looks like a fence can add a name. An export then keeps one more highlighter than it needs.
 */
export function fenceInfos(source: string): string[] {
  const infos = new Set<string>(source.startsWith("---") ? ["yaml"] : []);
  for (const match of source.matchAll(FENCE)) {
    if (match[1] !== undefined) {
      infos.add(match[1]);
    }
  }
  return [...infos];
}
