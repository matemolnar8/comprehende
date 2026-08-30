import type { LinePinnedSource, ReviewDocument, Source } from "./types.ts";

const SOURCE_LINK = /\]\(\s*source:([^)\s]+)(?:\s+"[^"]*")?\s*\)/g;

export function isLinePinned(source: Source): source is LinePinnedSource {
  return (
    source.kind === "pr-comment" &&
    source.path !== undefined &&
    source.side !== undefined &&
    source.line !== undefined
  );
}

export function citationIds(text: string): string[] {
  const ids: string[] = [];
  SOURCE_LINK.lastIndex = 0;
  for (const match of text.matchAll(SOURCE_LINK)) {
    const id = match[1];
    if (id !== undefined && id !== "") {
      ids.push(id);
    }
  }
  return ids;
}

export type CitationRef = {
  where: string;
  id: string;
};

export function documentCitationRefs(document: ReviewDocument): CitationRef[] {
  const out: CitationRef[] = [];
  const add = (where: string, text: string | undefined): void => {
    if (text === undefined) {
      return;
    }
    for (const id of citationIds(text)) {
      out.push({ where, id });
    }
  };
  add("why", document.why);
  add("summary", document.summary);
  document.groups.forEach((group, i) => {
    add(`groups[${i}].why`, group.why);
    add(`groups[${i}].summary`, group.summary);
    (group.lookFor ?? []).forEach((item, j) => {
      add(`groups[${i}].lookFor[${j}]`, item);
    });
  });
  return out;
}

export function sourceCitationErrors(document: ReviewDocument): string[] {
  const known = new Set((document.sources ?? []).map((source) => source.id));
  const seen = new Set<string>();
  const errors: string[] = [];
  for (const { where, id } of documentCitationRefs(document)) {
    const key = `${where}\0${id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    if (!known.has(id)) {
      errors.push(`source: unknown id "${id}" in ${where}`);
    }
  }
  return errors;
}

export function parseSourceHref(href: string | undefined): string | undefined {
  if (href === undefined || !href.startsWith("source:")) {
    return undefined;
  }
  const id = href.slice("source:".length);
  return id === "" ? undefined : id;
}

export function linePinnedSources(sources: readonly Source[] | undefined): LinePinnedSource[] {
  return (sources ?? []).filter(isLinePinned);
}

export function citedSourceIds(text: string): string[] {
  return [...new Set(citationIds(text))];
}

export function groupIdForPinnedSource(document: ReviewDocument, source: Source): string | undefined {
  if (!isLinePinned(source)) {
    return undefined;
  }
  const named = document.groups.filter((group) => (group.sources ?? []).includes(source.id));
  const covering = document.groups.filter((group) =>
    group.hunkRefs.some((ref) => ref.path === source.path || ref.oldPath === source.path),
  );
  const both = covering.filter((group) => named.some((item) => item.id === group.id));
  return (both[0] ?? covering[0] ?? named[0])?.id;
}

export function groupSourceIds(group: ReviewDocument["groups"][number]): string[] {
  const named = group.sources ?? [];
  const cited = [group.why, group.summary, ...(group.lookFor ?? [])].flatMap(citationIds);
  return [...new Set([...named, ...cited])];
}

export function textLineCount(content: string): number {
  if (content === "") {
    return 0;
  }
  const stripped = content.endsWith("\n") ? content.slice(0, -1) : content;
  return stripped.split("\n").length;
}
