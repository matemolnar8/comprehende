import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { parseReviewJson } from "../schema/parse.ts";
import type { ReviewDocument } from "../schema/types.ts";

export async function loadDocument(dataPath: string): Promise<ReviewDocument> {
  const text = await readFile(dataPath, "utf8");
  const parsed = parseReviewJson(text);
  if (!parsed.ok) {
    throw new Error(`invalid review document:\n${parsed.errors.map((error) => `  - ${error}`).join("\n")}`);
  }
  return parsed.document;
}

export function resolveDataPath(data: string | undefined, cwd: string): string {
  return resolveCliPath(data, cwd, "--data <review.json>");
}

export function resolveCliPath(value: string | undefined, cwd: string, flag: string): string {
  if (value === undefined) {
    throw new Error(`missing ${flag}`);
  }
  return isAbsolute(value) ? value : resolve(cwd, value);
}
