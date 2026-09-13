export const PART_PALETTE_SIZE = 6;

export type PartGroup = {
  id: string;
  part?: string;
  suggestedOrder?: number;
  dependsOn?: readonly string[];
};

export type Part = {
  colorIndex: number;
  title?: string;
  groupIds: string[];
};

export function groupParts(groups: readonly PartGroup[]): Part[] {
  const byId = new Map(groups.map((group, index) => [group.id, { group, index }] as const));
  const named = groups.some((group) => group.part !== undefined);
  if (!named) {
    return [
      {
        colorIndex: 0,
        groupIds: sortIds(
          groups.map((group) => group.id),
          byId,
        ),
      },
    ];
  }

  const buckets = new Map<string, string[]>();
  for (const group of groups) {
    const key = group.part ?? `\0${group.id}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(group.id);
    buckets.set(key, bucket);
  }

  const parts = [...buckets.entries()].map(([key, groupIds]) => {
    const ids = sortIds(groupIds, byId);
    return {
      title: key.startsWith("\0") ? undefined : key,
      groupIds: ids,
      minOrder: Math.min(
        ...groupIds.map((id) => {
          const entry = byId.get(id);
          return suggestedOrder(entry?.group, entry?.index ?? 0);
        }),
      ),
      sortKey: ids[0] ?? "",
    };
  });
  parts.sort((a, b) => a.minOrder - b.minOrder || (a.title ?? a.sortKey).localeCompare(b.title ?? b.sortKey));

  return parts.map((part, index) => ({
    colorIndex: index % PART_PALETTE_SIZE,
    groupIds: part.groupIds,
    ...(part.title !== undefined ? { title: part.title } : {}),
  }));
}

export function groupOrderIndex(parts: readonly Part[], id: string): number {
  let index = 0;
  for (const part of parts) {
    for (const groupId of part.groupIds) {
      index += 1;
      if (groupId === id) {
        return index;
      }
    }
  }
  return 0;
}

export function dependsOnDepth(groups: readonly PartGroup[], id: string, partIds: ReadonlySet<string>): number {
  const byId = new Map(groups.map((group) => [group.id, group]));
  const walk = (current: string, path: ReadonlySet<string>): number => {
    if (path.has(current)) {
      return 0;
    }
    const deps = (byId.get(current)?.dependsOn ?? []).filter((dep) => partIds.has(dep));
    if (deps.length === 0) {
      return 0;
    }
    const next = new Set(path);
    next.add(current);
    return 1 + Math.max(0, ...deps.map((dep) => walk(dep, next)));
  };
  return walk(id, new Set());
}

export function colorIndexByGroupId(parts: readonly Part[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const part of parts) {
    for (const id of part.groupIds) {
      map.set(id, part.colorIndex);
    }
  }
  return map;
}

export function partColor(colorIndex: number): string {
  return `var(--strand-${colorIndex % PART_PALETTE_SIZE})`;
}

export function isMixedReview(parts: readonly Part[]): boolean {
  return parts.length > 1;
}

function suggestedOrder(group: PartGroup | undefined, index: number): number {
  return group?.suggestedOrder ?? index;
}

function sortIds(ids: string[], byId: Map<string, { group: PartGroup; index: number }>): string[] {
  const idSet = new Set(ids);
  const remaining = new Set(ids);
  const indegree = new Map<string, number>();
  for (const id of ids) {
    const deps = (byId.get(id)?.group.dependsOn ?? []).filter((dep) => idSet.has(dep));
    indegree.set(id, deps.length);
  }
  const result: string[] = [];
  const byOrder = (a: string, b: string): number => {
    const left = byId.get(a);
    const right = byId.get(b);
    return (
      suggestedOrder(left?.group, left?.index ?? 0) - suggestedOrder(right?.group, right?.index ?? 0) || a.localeCompare(b)
    );
  };

  while (remaining.size > 0) {
    const ready = [...remaining].filter((id) => (indegree.get(id) ?? 0) === 0).sort(byOrder);
    const pick = ready[0];
    if (pick === undefined) {
      result.push(...[...remaining].sort(byOrder));
      break;
    }
    result.push(pick);
    remaining.delete(pick);
    for (const id of remaining) {
      if ((byId.get(id)?.group.dependsOn ?? []).includes(pick)) {
        indegree.set(id, Math.max(0, (indegree.get(id) ?? 1) - 1));
      }
    }
  }
  return result;
}
