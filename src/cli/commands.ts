import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { readHunkIndex, resolveSource } from "../git/diff.ts";
import { defaultBaseRef } from "../git/repo.ts";
import { coverReview, coverageErrors } from "../review/coverage.ts";
import { loadDocument, resolveCliPath } from "../review/load.ts";
import { commentPinErrors, staleCommentPins } from "../review/pins.ts";
import { skeletonDocument } from "../review/skeleton.ts";
import { sourceCitationErrors } from "../schema/source.ts";
import type { HunkIndex, ReviewDocument } from "../schema/types.ts";

export async function cmdIndex(cwd: string, base: string | undefined, head: string | undefined): Promise<HunkIndex> {
  const baseRef = base ?? (await defaultBaseRef(cwd));
  const headRef = head ?? "HEAD";
  return readHunkIndex(cwd, baseRef, headRef);
}

export function resolveOutPath(out: string | undefined, cwd: string): string {
  return resolveCliPath(out, cwd, "--out <dir>");
}

export async function cmdReview(
  cwd: string,
  dataPath: string,
  base: string | undefined,
  head: string | undefined,
): Promise<{ document: ReviewDocument; index: HunkIndex }> {
  const index = await cmdIndex(cwd, base, head);
  const skeleton = skeletonDocument(index);
  await mkdir(dirname(dataPath), { recursive: true });
  await writeFile(dataPath, `${JSON.stringify(skeleton, null, 2)}\n`);
  const document = await loadDocument(dataPath);
  return { document, index };
}

export async function cmdValidate(
  cwd: string,
  dataPath: string,
): Promise<{ document: ReviewDocument; warnings: string[]; assignedHunks: number }> {
  const document = await loadDocument(dataPath);
  const resolved = await resolveSource(cwd, document.source.baseRef, document.source.headRef);
  const { coverage } = await coverReview(cwd, document);
  const pins = await staleCommentPins(cwd, document, resolved);
  const errors = [...coverageErrors(coverage), ...sourceCitationErrors(document), ...commentPinErrors(pins)];
  if (errors.length > 0) {
    throw new Error(errors.join("\n\n"));
  }
  return { document, warnings: [], assignedHunks: coverage.assignedHunks };
}
