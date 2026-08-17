export const PART_PALETTE_SIZE = 6;

export type PartLayer = {
  id: string;
  part?: string;
  suggestedOrder: number;
};

export type Part = {
  colorIndex: number;
  title?: string;
  layerIds: string[];
};

export function groupParts(layers: readonly PartLayer[]): Part[] {
  const order = new Map(layers.map((layer) => [layer.id, layer.suggestedOrder]));
  const named = layers.some((layer) => layer.part !== undefined);
  if (!named) {
    return [
      {
        colorIndex: 0,
        layerIds: sortIds(
          layers.map((layer) => layer.id),
          order,
        ),
      },
    ];
  }

  const buckets = new Map<string, string[]>();
  for (const layer of layers) {
    const key = layer.part ?? `\0${layer.id}`;
    const bucket = buckets.get(key) ?? [];
    bucket.push(layer.id);
    buckets.set(key, bucket);
  }

  const parts = [...buckets.entries()].map(([key, layerIds]) => {
    const ids = sortIds(layerIds, order);
    return {
      title: key.startsWith("\0") ? undefined : key,
      layerIds: ids,
      minOrder: order.get(ids[0] ?? "") ?? 0,
      sortKey: ids[0] ?? "",
    };
  });
  parts.sort((a, b) => a.minOrder - b.minOrder || (a.title ?? a.sortKey).localeCompare(b.title ?? b.sortKey));

  return parts.map((part, index) => ({
    colorIndex: index % PART_PALETTE_SIZE,
    layerIds: part.layerIds,
    ...(part.title !== undefined ? { title: part.title } : {}),
  }));
}

export function colorIndexByLayerId(parts: readonly Part[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const part of parts) {
    for (const id of part.layerIds) {
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
