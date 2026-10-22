import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { formatStoredHunkRef } from "../schema/identity.ts";
import type { ReviewDocument, StoredReviewDocument } from "../schema/types.ts";

export function storedDocument(document: ReviewDocument): StoredReviewDocument {
  return {
    ...document,
    groups: document.groups.map((group) => ({
      ...group,
      hunkRefs: group.hunkRefs.map((ref) => formatStoredHunkRef(ref)),
    })),
  };
}

/** The on-disk form, two-space indent. */
export function reviewFileBody(document: ReviewDocument): string {
  return `${JSON.stringify(storedDocument(document), null, 2)}\n`;
}

export async function writeDocument(dataPath: string, document: ReviewDocument): Promise<void> {
  await mkdir(dirname(dataPath), { recursive: true });
  await writeFile(dataPath, reviewFileBody(document));
}
