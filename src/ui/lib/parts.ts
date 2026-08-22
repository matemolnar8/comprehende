export const PART_PALETTE_SIZE = 6;

export type PartGroup = {
  id: string;
  part?: string;
  suggestedOrder: number;
};

export type Part = {
  colorIndex: number;
  title?: string;
  groupIds: string[];
};

export function groupParts(groups: readonly PartGroup[]): Part[] {
  const order = new Map(groups.map((group) => [group.id, group.suggestedOrder]));
  const named = groups.some((group) => group.part !== undefined);
  if (!named) {
    return [
      {
        colorIndex: 0,
        groupIds: sortIds(
          groups.map((group) => group.id),
          order,
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
    const ids = sortIds(groupIds, order);
    return {
      title: key.startsWith("\0") ? undefined : key,
      groupIds: ids,
      minOrder: order.get(ids[0] ?? "") ?? 0,
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

function sortIds(ids: string[], order: Map<string, number>): string[] {
  return [...ids].sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0) || a.localeCompare(b));
}
