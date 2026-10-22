import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { formatStoredHunkRef } from "../schema/identity.ts";
import type { ReviewDocument } from "../schema/types.ts";

/** The on-disk form: hunk refs as strings, two-space indent. */
export function reviewFileBody(document: ReviewDocument): string {
  const written = {
    ...document,
    groups: document.groups.map((group) => ({
      ...group,
      hunkRefs: group.hunkRefs.map((ref) => formatStoredHunkRef(ref)),
    })),
  };
  return `${JSON.stringify(written, null, 2)}\n`;
}

export async function writeDocument(dataPath: string, document: ReviewDocument): Promise<void> {
  await mkdir(dirname(dataPath), { recursive: true });
  await writeFile(dataPath, reviewFileBody(document));
}
