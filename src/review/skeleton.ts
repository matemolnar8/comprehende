import type { HunkIndex, ReviewSource } from "../schema/types.ts";

export type SkeletonDocument = {
  version: 1;
  source: ReviewSource;
  size: "small";
  title: string;
  summary: string;
  groups: [
    {
      id: "ungrouped";
      title: "Ungrouped";
      why: string;
      summary: string;
      suggestedOrder: number;
      hunkRefs: string[];
    },
  ];
};

/** One path per changed file. A path covers every live hunk of that file. */
export function skeletonPaths(index: HunkIndex): string[] {
  const paths: string[] = [];
  const seen = new Set<string>();
  for (const hunk of index.hunks) {
    if (seen.has(hunk.path)) {
      continue;
    }
    seen.add(hunk.path);
    paths.push(hunk.path);
  }
  return paths;
}

/** Covering skeleton: one path per file, stub prose the skill must fill. */
export function skeletonDocument(index: HunkIndex): SkeletonDocument {
  return {
    version: 1,
    source: index.source,
    size: "small",
    title: "Untitled",
    summary: "Fill this review.",
    groups: [
      {
        id: "ungrouped",
        title: "Ungrouped",
        why: "Fill this group.",
        summary: "",
        suggestedOrder: 0,
        hunkRefs: skeletonPaths(index),
      },
    ],
  };
}
