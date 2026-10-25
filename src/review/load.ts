import { readFile } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
import { parseReviewJson } from "../schema/parse.ts";
import type { ReviewDocument } from "../schema/types.ts";

export async function loadDocument(dataPath: string): Promise<ReviewDocument> {
  const parsed = parseReviewJson(decodeText(await readFile(dataPath)));
  if (!parsed.ok) {
    throw new Error(
      `invalid review document:\n${parsed.errors.map((error) => `  - ${error}`).join("\n")}`,
    );
  }
  return parsed.document;
}

/** PowerShell 5.1 writes UTF-8 with a BOM, and its `>` writes UTF-16LE. TextDecoder drops the BOM. */
function decodeText(bytes: Uint8Array): string {
  const utf16 = bytes[0] === 0xff && bytes[1] === 0xfe;
  return new TextDecoder(utf16 ? "utf-16le" : "utf-8").decode(bytes);
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
