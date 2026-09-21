import { toHunkRef } from "../git/diff.ts";
import type { HunkIndex, ReviewDocument } from "../schema/types.ts";

/** Covering skeleton: every index hunk ref, stub prose the skill must fill. */
export function skeletonDocument(index: HunkIndex): ReviewDocument {
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
        hunkRefs: index.hunks.map(toHunkRef),
      },
    ],
  };
}
