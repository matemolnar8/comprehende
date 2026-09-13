import { hunkKey } from "../schema/identity.ts";
import type { HunkRef, ReviewDocument, ReviewGroup, ReviewSize, ReviewSource, Source } from "../schema/types.ts";

const HUNK_MATCH_MIN_CONTAINMENT = 0.5;

export type ListDiff = {
  added: string[];
  removed: string[];
};

export type TextChange = {
  from?: string;
  to?: string;
};

export type GroupMatchReason = "id" | "title" | "hunks";

export type GroupSide = {
  id: string;
  title: string;
  why: string;
  summary: string;
  part?: string;
  lookFor: string[];
  sources: string[];
  dependsOn: string[];
  suggestedOrder: number;
  hunkRefs: HunkRef[];
};

export type ChangedGroup = {
  reason: GroupMatchReason;
  from: GroupSide;
  to: GroupSide;
  retitled: boolean;
  regrouped: boolean;
  title?: { from: string; to: string };
  why?: { from: string; to: string };
  summary?: { from: string; to: string };
  part?: TextChange;
  suggestedOrder?: { from: number; to: number };
  lookFor: ListDiff;
  sources: ListDiff;
  dependsOn: ListDiff;
  hunks: { added: HunkRef[]; removed: HunkRef[] };
};

export type DocumentDiff = {
  title?: { from: string; to: string };
  summary?: { from: string; to: string };
  why?: TextChange;
  size?: { from: ReviewSize; to: ReviewSize };
  range?: { from: string; to: string };
  lookFor: ListDiff;
  sources: {
    added: Source[];
    removed: Source[];
    changed: { from: Source; to: Source }[];
  };
};

export type ReviewComparison = {
  identical: boolean;
  document: DocumentDiff;
  groups: {
    added: GroupSide[];
    removed: GroupSide[];
    changed: ChangedGroup[];
    unchangedCount: number;
  };
};

export type CompareSide = {
  path: string;
  title: string;
  size: ReviewSize;
  source: ReviewSource;
  sources: Source[];
};

export type ComparePayload = {
  from: CompareSide;
  to: CompareSide;
  comparison: ReviewComparison;
};

export function formatReviewRange(source: ReviewSource): string {
  return source.range ?? `${source.baseRef}...${source.headRef}`;
}

export function listDiffHasChanges(diff: ListDiff): boolean {
  return diff.added.length > 0 || diff.removed.length > 0;
}

export function buildComparePayload(
  fromPath: string,
  from: ReviewDocument,
  toPath: string,
  to: ReviewDocument,
): ComparePayload {
  return {
    from: compareSide(fromPath, from),
    to: compareSide(toPath, to),
    comparison: compareReviews(from, to),
  };
}

export function compareReviews(from: ReviewDocument, to: ReviewDocument): ReviewComparison {
  const groupMatches = matchGroups(from.groups, to.groups);
  const fromToGroupId = new Map(groupMatches.map((match) => [from.groups[match.fromIndex]!.id, to.groups[match.toIndex]!.id]));
  const sourceMatches = matchSources(from.sources ?? [], to.sources ?? []);
  const fromToSourceId = new Map(
    sourceMatches.map((match) => [(from.sources ?? [])[match.fromIndex]!.id, (to.sources ?? [])[match.toIndex]!.id]),
  );

  const changed: ChangedGroup[] = [];
  const matchedFrom = new Set<number>();
  const matchedTo = new Set<number>();
  let unchangedCount = 0;

  for (const match of groupMatches) {
    matchedFrom.add(match.fromIndex);
    matchedTo.add(match.toIndex);
    const fromGroup = from.groups[match.fromIndex]!;
    const toGroup = to.groups[match.toIndex]!;
    const item = diffMatchedGroup(fromGroup, toGroup, match.reason, fromToGroupId, fromToSourceId);
    if (groupHasChanges(item)) {
      changed.push(item);
    } else {
      unchangedCount += 1;
    }
  }

  changed.sort((a, b) => a.to.suggestedOrder - b.to.suggestedOrder || a.to.id.localeCompare(b.to.id));

  const addedGroups = to.groups
    .filter((_, index) => !matchedTo.has(index))
    .map(groupSide)
    .sort((a, b) => a.suggestedOrder - b.suggestedOrder || a.id.localeCompare(b.id));
  const removedGroups = from.groups
    .filter((_, index) => !matchedFrom.has(index))
    .map(groupSide)
    .sort((a, b) => a.suggestedOrder - b.suggestedOrder || a.id.localeCompare(b.id));

  const document = diffDocument(from, to, sourceMatches, fromToSourceId);
  const identical =
    !documentHasChanges(document) && addedGroups.length === 0 && removedGroups.length === 0 && changed.length === 0;

  return {
    identical,
    document,
    groups: {
      added: addedGroups,
      removed: removedGroups,
      changed,
      unchangedCount,
    },
  };
}

function compareSide(path: string, document: ReviewDocument): CompareSide {
  return {
    path,
    title: document.title,
    size: document.size,
    source: document.source,
    sources: document.sources ?? [],
  };
}

function diffDocument(
  from: ReviewDocument,
  to: ReviewDocument,
  sourceMatches: IndexPair[],
  sourceIdMap: ReadonlyMap<string, string>,
): DocumentDiff {
  const fromSources = from.sources ?? [];
  const toSources = to.sources ?? [];
  const matchedFrom = new Set(sourceMatches.map((match) => match.fromIndex));
  const matchedTo = new Set(sourceMatches.map((match) => match.toIndex));
  const changed: { from: Source; to: Source }[] = [];
  for (const match of sourceMatches) {
    const fromSource = fromSources[match.fromIndex]!;
    const toSource = toSources[match.toIndex]!;
    if (!sourcesEqual(fromSource, toSource)) {
      changed.push({ from: fromSource, to: toSource });
    }
  }
  return {
    title: mappedStringChange(from.title, to.title, sourceIdMap),
    summary: mappedStringChange(from.summary, to.summary, sourceIdMap),
    why: mappedOptionalChange(from.why, to.why, sourceIdMap),
    size: from.size === to.size ? undefined : { from: from.size, to: to.size },
    range: stringChange(formatReviewRange(from.source), formatReviewRange(to.source)),
    lookFor: mappedListDiff(from.lookFor, to.lookFor, sourceIdMap),
    sources: {
      added: toSources.filter((_, index) => !matchedTo.has(index)),
      removed: fromSources.filter((_, index) => !matchedFrom.has(index)),
      changed,
    },
  };
}

function diffMatchedGroup(
  from: ReviewGroup,
  to: ReviewGroup,
  reason: GroupMatchReason,
  groupIdMap: ReadonlyMap<string, string>,
  sourceIdMap: ReadonlyMap<string, string>,
): ChangedGroup {
  const hunks = hunkDiff(from.hunkRefs, to.hunkRefs);
  const title = stringChange(from.title, to.title);
  return {
    reason,
    from: groupSide(from),
    to: groupSide(to),
    retitled: title !== undefined,
    regrouped: hunks.added.length > 0 || hunks.removed.length > 0,
    title,
    why: mappedStringChange(from.why, to.why, sourceIdMap),
    summary: mappedStringChange(from.summary, to.summary, sourceIdMap),
    part: optionalStringChange(from.part, to.part),
    suggestedOrder:
      from.suggestedOrder === to.suggestedOrder ? undefined : { from: from.suggestedOrder, to: to.suggestedOrder },
    lookFor: mappedListDiff(from.lookFor, to.lookFor, sourceIdMap),
    sources: listDiff(remapIds(from.sources ?? [], sourceIdMap), to.sources ?? []),
    dependsOn: listDiff(remapIds(from.dependsOn ?? [], groupIdMap), to.dependsOn ?? []),
    hunks,
  };
}

function groupHasChanges(group: ChangedGroup): boolean {
  return (
    group.retitled ||
    group.regrouped ||
    group.why !== undefined ||
    group.summary !== undefined ||
    group.part !== undefined ||
    group.suggestedOrder !== undefined ||
    listDiffHasChanges(group.lookFor) ||
    listDiffHasChanges(group.sources) ||
    listDiffHasChanges(group.dependsOn)
  );
}

function documentHasChanges(document: DocumentDiff): boolean {
  return (
    document.title !== undefined ||
    document.summary !== undefined ||
    document.why !== undefined ||
    document.size !== undefined ||
    document.range !== undefined ||
    listDiffHasChanges(document.lookFor) ||
    document.sources.added.length > 0 ||
    document.sources.removed.length > 0 ||
    document.sources.changed.length > 0
  );
}

type IndexPair = { fromIndex: number; toIndex: number };
type GroupPair = IndexPair & { reason: GroupMatchReason };

function matchGroups(from: ReviewGroup[], to: ReviewGroup[]): GroupPair[] {
  const fromUsed = new Set<number>();
  const toUsed = new Set<number>();
  const matches: GroupPair[] = [];

  for (const pair of pairById(from, to, fromUsed, toUsed)) {
    matches.push({ ...pair, reason: "id" });
  }
  for (const pair of pairByUniqueKey(from, to, fromUsed, toUsed, (group) => group.title)) {
    matches.push({ ...pair, reason: "title" });
  }

  const candidates: { fromIndex: number; toIndex: number; intersection: number; containment: number; jaccard: number }[] =
    [];
  from.forEach((fromGroup, fromIndex) => {
    if (fromUsed.has(fromIndex)) {
      return;
    }
    const fromHunks = hunkKeys(fromGroup);
    if (fromHunks.size === 0) {
      return;
    }
    to.forEach((toGroup, toIndex) => {
      if (toUsed.has(toIndex)) {
        return;
      }
      const toHunks = hunkKeys(toGroup);
      if (toHunks.size === 0) {
        return;
      }
      const intersection = intersectionSize(fromHunks, toHunks);
      if (intersection === 0) {
        return;
      }
      const containment = intersection / Math.min(fromHunks.size, toHunks.size);
      if (containment < HUNK_MATCH_MIN_CONTAINMENT) {
        return;
      }
      const union = fromHunks.size + toHunks.size - intersection;
      candidates.push({
        fromIndex,
        toIndex,
        intersection,
        containment,
        jaccard: intersection / union,
      });
    });
  });
  candidates.sort(
    (a, b) => b.intersection - a.intersection || b.containment - a.containment || b.jaccard - a.jaccard,
  );
  for (const candidate of candidates) {
    if (fromUsed.has(candidate.fromIndex) || toUsed.has(candidate.toIndex)) {
      continue;
    }
    fromUsed.add(candidate.fromIndex);
    toUsed.add(candidate.toIndex);
    matches.push({ fromIndex: candidate.fromIndex, toIndex: candidate.toIndex, reason: "hunks" });
  }
  return matches;
}

function matchSources(from: Source[], to: Source[]): IndexPair[] {
  const fromUsed = new Set<number>();
  const toUsed = new Set<number>();
  return [
    ...pairById(from, to, fromUsed, toUsed),
    ...pairByUniqueKey(from, to, fromUsed, toUsed, (source) => `${source.kind}\0${source.label}`),
    ...pairByUniqueKey(from, to, fromUsed, toUsed, (source) =>
      source.url === undefined ? undefined : `${source.kind}\0${source.url}`,
    ),
  ];
}

function pairById<T extends { id: string }>(
  from: T[],
  to: T[],
  fromUsed: Set<number>,
  toUsed: Set<number>,
): IndexPair[] {
  const toById = new Map<string, number>();
  to.forEach((item, index) => {
    if (!toUsed.has(index)) {
      toById.set(item.id, index);
    }
  });
  const pairs: IndexPair[] = [];
  from.forEach((item, fromIndex) => {
    if (fromUsed.has(fromIndex)) {
      return;
    }
    const toIndex = toById.get(item.id);
    if (toIndex === undefined || toUsed.has(toIndex)) {
      return;
    }
    fromUsed.add(fromIndex);
    toUsed.add(toIndex);
    pairs.push({ fromIndex, toIndex });
  });
  return pairs;
}

function pairByUniqueKey<T>(
  from: T[],
  to: T[],
  fromUsed: Set<number>,
  toUsed: Set<number>,
  keyOf: (item: T) => string | undefined,
): IndexPair[] {
  const fromKeys = uniqueKeys(from, fromUsed, keyOf);
  const toKeys = uniqueKeys(to, toUsed, keyOf);
  const pairs: IndexPair[] = [];
  for (const [key, fromIndex] of fromKeys) {
    const toIndex = toKeys.get(key);
    if (toIndex === undefined || fromUsed.has(fromIndex) || toUsed.has(toIndex)) {
      continue;
    }
    fromUsed.add(fromIndex);
    toUsed.add(toIndex);
    pairs.push({ fromIndex, toIndex });
  }
  return pairs;
}

function uniqueKeys<T>(
  items: T[],
  used: ReadonlySet<number>,
  keyOf: (item: T) => string | undefined,
): Map<string, number> {
  const buckets = new Map<string, number[]>();
  items.forEach((item, index) => {
    if (used.has(index)) {
      return;
    }
    const key = keyOf(item);
    if (key === undefined || key === "") {
      return;
    }
    const list = buckets.get(key) ?? [];
    list.push(index);
    buckets.set(key, list);
  });
  const unique = new Map<string, number>();
  for (const [key, list] of buckets) {
    const index = list[0];
    if (list.length === 1 && index !== undefined) {
      unique.set(key, index);
    }
  }
  return unique;
}

function groupSide(group: ReviewGroup): GroupSide {
  const side: GroupSide = {
    id: group.id,
    title: group.title,
    why: group.why,
    summary: group.summary,
    lookFor: group.lookFor ?? [],
    sources: group.sources ?? [],
    dependsOn: group.dependsOn ?? [],
    suggestedOrder: group.suggestedOrder,
    hunkRefs: group.hunkRefs,
  };
  if (group.part !== undefined) {
    side.part = group.part;
  }
  return side;
}

function listDiff(from: readonly string[] | undefined, to: readonly string[] | undefined): ListDiff {
  const fromList = from ?? [];
  const toList = to ?? [];
  const fromSet = new Set(fromList);
  const toSet = new Set(toList);
  return {
    added: toList.filter((item) => !fromSet.has(item)),
    removed: fromList.filter((item) => !toSet.has(item)),
  };
}

function hunkDiff(from: HunkRef[], to: HunkRef[]): { added: HunkRef[]; removed: HunkRef[] } {
  const fromKeys = new Set(from.map(hunkKey));
  const toKeys = new Set(to.map(hunkKey));
  return {
    added: to.filter((ref) => !fromKeys.has(hunkKey(ref))),
    removed: from.filter((ref) => !toKeys.has(hunkKey(ref))),
  };
}

function hunkKeys(group: ReviewGroup): Set<string> {
  return new Set(group.hunkRefs.map(hunkKey));
}

function intersectionSize(a: ReadonlySet<string>, b: ReadonlySet<string>): number {
  let count = 0;
  for (const key of a) {
    if (b.has(key)) {
      count += 1;
    }
  }
  return count;
}

function remapIds(ids: readonly string[], map: ReadonlyMap<string, string>): string[] {
  return ids.map((id) => map.get(id) ?? id);
}

function rewriteCitations(text: string, map: ReadonlyMap<string, string>): string {
  if (map.size === 0) {
    return text;
  }
  return text.replace(/\]\(\s*source:([^)\s]+)(?:\s+"[^"]*")?\s*\)/g, (full, id: string) => {
    const next = map.get(id);
    if (next === undefined || next === id) {
      return full;
    }
    return full.replace(`source:${id}`, `source:${next}`);
  });
}

function stringChange(from: string, to: string): { from: string; to: string } | undefined {
  return from === to ? undefined : { from, to };
}

function mappedStringChange(
  from: string,
  to: string,
  sourceIdMap: ReadonlyMap<string, string>,
): { from: string; to: string } | undefined {
  return rewriteCitations(from, sourceIdMap) === to ? undefined : { from, to };
}

function mappedOptionalChange(
  from: string | undefined,
  to: string | undefined,
  sourceIdMap: ReadonlyMap<string, string>,
): TextChange | undefined {
  const fromMapped = from === undefined ? undefined : rewriteCitations(from, sourceIdMap);
  if (fromMapped === to) {
    return undefined;
  }
  return optionalStringChange(from, to);
}

function mappedListDiff(
  from: readonly string[] | undefined,
  to: readonly string[] | undefined,
  sourceIdMap: ReadonlyMap<string, string>,
): ListDiff {
  const fromList = from ?? [];
  const toList = to ?? [];
  const rewritten = fromList.map((item) => rewriteCitations(item, sourceIdMap));
  const toSet = new Set(toList);
  const rewrittenSet = new Set(rewritten);
  return {
    added: toList.filter((item) => !rewrittenSet.has(item)),
    removed: fromList.filter((_, index) => {
      const mapped = rewritten[index];
      return mapped === undefined || !toSet.has(mapped);
    }),
  };
}

function optionalStringChange(from: string | undefined, to: string | undefined): TextChange | undefined {
  if (from === to) {
    return undefined;
  }
  const change: TextChange = {};
  if (from !== undefined) {
    change.from = from;
  }
  if (to !== undefined) {
    change.to = to;
  }
  return change;
}

function sourcesEqual(from: Source, to: Source): boolean {
  return (
    from.id === to.id &&
    from.kind === to.kind &&
    from.label === to.label &&
    from.url === to.url &&
    from.title === to.title &&
    from.gist === to.gist &&
    from.part === to.part &&
    from.author === to.author &&
    from.body === to.body &&
    from.path === to.path &&
    from.side === to.side &&
    from.line === to.line
  );
}
