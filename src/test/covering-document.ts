import { writeFile } from "node:fs/promises";
import { toHunkRef } from "../git/diff.ts";
import type { HunkIndex, ReviewDocument } from "../schema/types.ts";

export function coveringDocument(index: HunkIndex): ReviewDocument {
  return {
    version: 1,
    source: index.source,
    size: "small",
    summary: "Every hunk in the range.",
    groups: [
      {
        id: "all",
        title: "All changes",
        why: "Covers every hunk in the range.",
        summary: "Every hunk in the range.",
        suggestedOrder: 0,
        hunkRefs: index.hunks.map(toHunkRef),
      },
    ],
  };
}

export async function writeCoveringDocument(dataPath: string, index: HunkIndex): Promise<ReviewDocument> {
  const document = coveringDocument(index);
  await writeFile(dataPath, `${JSON.stringify(document, null, 2)}\n`);
  return document;
}
