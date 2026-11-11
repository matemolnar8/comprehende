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

const REPOSITORY = "https://repository.invalid";

/**
 * The repository path that a file means by a relative address, such as `../img/a.png` in
 * `docs/guide/x.md`. A leading `/` is the root of the repository. Undefined for a web address.
 */
export function repositoryPath(target: string, from: string): string | undefined {
  try {
    const base = from.split("/").map(encodeURIComponent).join("/");
    const url = new URL(target, `${REPOSITORY}/${base}`);
    if (url.origin !== REPOSITORY) {
      return undefined;
    }
    // A file name can hold a bare `%`, which is not an escape. It stays a `%`.
    return decodeURIComponent(url.pathname.slice(1).replace(/%(?![0-9a-f]{2})/gi, "%25"));
  } catch {
    return undefined;
  }
}

const IMAGE_TARGET =
  /!\[[^\]]*\]\(\s*<?([^)\s>]+)|<img\b[^>]*?\bsrc\s*=\s*["']?([^"'\s>]+)|^ {0,3}\[[^\]]+\]:\s*<?([^\s>]+)/gim;

/**
 * The addresses a Markdown file can show as images: `![alt](address)`, `<img src>`, and each link
 * definition, which an image can name. A match that is no image costs one failed read.
 */
export function imageTargets(source: string): string[] {
  const targets = new Set<string>();
  for (const match of source.matchAll(IMAGE_TARGET)) {
    const target = match[1] ?? match[2] ?? match[3];
    if (target !== undefined) {
      targets.add(target);
    }
  }
  return [...targets];
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
