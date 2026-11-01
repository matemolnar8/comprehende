import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { formatStoredHunkRef } from "../schema/identity.ts";
import type { ReviewDocument, StoredReviewDocument } from "../schema/types.ts";

export function storedDocument(document: ReviewDocument): StoredReviewDocument {
  return {
    ...document,
    groups: document.groups.map(({ legacyLookFor: _legacy, ...group }) => ({
      ...group,
      hunkRefs: group.hunkRefs.map((ref) => formatStoredHunkRef(ref)),
    })),
  };
}

/** The on-disk form, two-space indent. Legacy group lookFor stays, so the skill can still convert it. */
export function reviewFileBody(document: ReviewDocument): string {
  const stored = storedDocument(document);
  const groups = stored.groups.map((group, i) => {
    const lookFor = document.groups[i]?.legacyLookFor;
    return lookFor === undefined ? group : { ...group, lookFor };
  });
  return `${JSON.stringify({ ...stored, groups }, null, 2)}\n`;
}

export async function writeDocument(dataPath: string, document: ReviewDocument): Promise<void> {
  await mkdir(dirname(dataPath), { recursive: true });
  await writeFile(dataPath, reviewFileBody(document));
}
