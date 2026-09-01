import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";

export const SHIKI_LANGS_FILE = "shiki-langs.json";

const LANG_MODULE = /[/\\]@shikijs[/\\]langs[/\\]dist[/\\]([^/\\]+)\.m?js(?:\?|$)/;
const SKIP_LANGS = new Set(["text", "ansi"]);

export function shikiLangId(id: string): string | undefined {
  return id.match(LANG_MODULE)?.[1];
}

export type ShikiLangsManifest = {
  version: 1;
  /** Every highlighter chunk, relative to the UI root. */
  chunks: string[];
  /** Language id to the chunks that language needs, including static embeds. */
  files: Record<string, string[]>;
  /** Pierre filename and extension map. Same lookup the UI uses. */
  lookup: Record<string, string>;
};

export function parseShikiLangsManifest(input: unknown): ShikiLangsManifest | undefined {
  if (!isRecord(input) || input.version !== 1) {
    return undefined;
  }
  const chunks = stringList(input.chunks);
  const files = stringListMap(input.files);
  const lookup = stringMap(input.lookup);
  if (chunks === undefined || files === undefined || lookup === undefined) {
    return undefined;
  }
  return { version: 1, chunks, files, lookup };
}

export function highlightLangFromPath(path: string, lookup: Record<string, string>): string | undefined {
  const fileName = path.split(/[/\\]/).pop() ?? path;
  if (lookup[fileName] !== undefined) {
    return lookup[fileName];
  }
  const compound = fileName.match(/\.([^/\\]+\.[^/\\]+)$/)?.[1];
  if (compound !== undefined && lookup[compound] !== undefined) {
    return lookup[compound];
  }
  const simple = fileName.match(/\.([^.]+)$/)?.[1] ?? "";
  return lookup[simple];
}

export function highlightLangsForPaths(paths: readonly string[], lookup: Record<string, string>): string[] {
  const langs = new Set<string>();
  for (const path of paths) {
    const lang = highlightLangFromPath(path, lookup);
    if (lang !== undefined && !SKIP_LANGS.has(lang)) {
      langs.add(lang);
    }
  }
  return [...langs];
}

export function highlightPathsFromFiles(files: readonly { path: string; oldPath?: string }[]): string[] {
  const paths: string[] = [];
  for (const file of files) {
    paths.push(file.path);
    if (file.oldPath !== undefined) {
      paths.push(file.oldPath);
    }
  }
  return paths;
}

export function chunksToKeep(manifest: ShikiLangsManifest, langs: readonly string[]): string[] | undefined {
  const keep = new Set<string>();
  for (const lang of langs) {
    const files = manifest.files[lang];
    if (files === undefined) {
      return undefined;
    }
    for (const file of files) {
      keep.add(file);
    }
  }
  return [...keep];
}

export async function pruneUnusedHighlighterChunks(outDir: string, paths: readonly string[]): Promise<string[]> {
  const manifest = await loadManifest(join(outDir, SHIKI_LANGS_FILE));
  if (manifest === undefined) {
    return [];
  }
  const langs = highlightLangsForPaths(paths, manifest.lookup);
  const keep = chunksToKeep(manifest, langs);
  if (keep === undefined) {
    return [];
  }
  const keepSet = new Set(keep);
  const removed: string[] = [];
  for (const file of manifest.chunks) {
    if (keepSet.has(file)) {
      continue;
    }
    await rm(join(outDir, file), { force: true });
    await rm(join(outDir, `${file}.map`), { force: true });
    removed.push(file);
  }
  return removed;
}

async function loadManifest(path: string): Promise<ShikiLangsManifest | undefined> {
  let text: string;
  try {
    text = await readFile(path, "utf8");
  } catch {
    return undefined;
  }
  try {
    return parseShikiLangsManifest(JSON.parse(text) as unknown);
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    return undefined;
  }
  return value;
}

function stringMap(value: unknown): Record<string, string> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item !== "string") {
      return undefined;
    }
    out[key] = item;
  }
  return out;
}

function stringListMap(value: unknown): Record<string, string[]> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const out: Record<string, string[]> = {};
  for (const [key, item] of Object.entries(value)) {
    const list = stringList(item);
    if (list === undefined) {
      return undefined;
    }
    out[key] = list;
  }
  return out;
}
