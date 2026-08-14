import { readFile, writeFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { readHunkIndex, resolveSource } from "../git/diff.ts";
import { defaultBaseRef } from "../git/repo.ts";
import { coverReview, coverageErrors } from "../review/coverage.ts";
import { generateReviewDocument } from "../review/generate.ts";
import { parseReviewJson } from "../schema/parse.ts";
import type { HunkIndex, ReviewDocument } from "../schema/types.ts";

export async function resolveRange(
  cwd: string,
  base: string | undefined,
  head: string | undefined,
): Promise<{ baseRef: string; headRef: string }> {
  const baseRef = base ?? (await defaultBaseRef(cwd));
  const headRef = head ?? "HEAD";
  await resolveSource(cwd, baseRef, headRef);
  return { baseRef, headRef };
}

export async function cmdIndex(cwd: string, base: string | undefined, head: string | undefined): Promise<HunkIndex> {
  const range = await resolveRange(cwd, base, head);
  return readHunkIndex(cwd, range.baseRef, range.headRef);
}

export async function loadDocument(dataPath: string): Promise<ReviewDocument> {
  const text = await readFile(dataPath, "utf8");
  const parsed = parseReviewJson(text);
  if (!parsed.ok) {
    throw new Error(`invalid review document:\n${parsed.errors.map((error) => `  - ${error}`).join("\n")}`);
  }
  return parsed.document;
}

export function resolveDataPath(data: string | undefined, cwd: string): string {
  if (data === undefined) {
    throw new Error("missing --data <review.json>");
  }
  return isAbsolute(data) ? data : resolve(cwd, data);
}

export async function cmdValidate(cwd: string, dataPath: string): Promise<{ document: ReviewDocument; warnings: string[] }> {
  const document = await loadDocument(dataPath);
  await resolveSource(cwd, document.source.baseRef, document.source.headRef);
  const { coverage } = await coverReview(cwd, document);
  const errors = coverageErrors(coverage);
  if (errors.length > 0) {
    throw new Error(errors.join("\n\n"));
  }
  return { document, warnings: [] };
}

export async function cmdGenerate(
  cwd: string,
  dataPath: string,
  base: string | undefined,
  head: string | undefined,
): Promise<ReviewDocument> {
  const index = await cmdIndex(cwd, base, head);
  const document = await generateReviewDocument(cwd, index);
  await writeFile(dataPath, `${JSON.stringify(document, null, 2)}\n`, "utf8");
  const { coverage } = await coverReview(cwd, document);
  const errors = coverageErrors(coverage);
  if (errors.length > 0) {
    throw new Error(`generate produced an incomplete review:\n${errors.join("\n\n")}`);
  }
  return document;
}
