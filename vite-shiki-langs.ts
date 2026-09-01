import { EXTENSION_TO_FILE_FORMAT } from "@pierre/diffs";
import type { Plugin } from "vite";
import { SHIKI_LANGS_FILE, shikiLangId, type ShikiLangsManifest } from "./src/api/shiki-langs.ts";

export function shikiLangChunks(): Plugin {
  return {
    name: "shiki-lang-chunks",
    outputOptions(options) {
      const previous = options.manualChunks;
      options.manualChunks = (id, meta) => {
        const lang = shikiLangId(id);
        if (lang !== undefined) {
          return `shiki-lang-${lang}`;
        }
        if (typeof previous === "function") {
          return previous(id, meta);
        }
        return undefined;
      };
    },
    generateBundle(_options, bundle) {
      const chunkImports = new Map<string, string[]>();
      const langFiles = new Map<string, string>();
      for (const [fileName, item] of Object.entries(bundle)) {
        if (item.type !== "chunk") {
          continue;
        }
        chunkImports.set(fileName, [...item.imports]);
        for (const moduleId of item.moduleIds) {
          const lang = shikiLangId(moduleId);
          if (lang !== undefined) {
            langFiles.set(lang, fileName);
          }
        }
      }

      const chunks = [...new Set(langFiles.values())];
      if (chunks.length === 0) {
        return;
      }
      const langChunkSet = new Set(chunks);
      const files: Record<string, string[]> = {};
      for (const [lang, fileName] of langFiles) {
        files[lang] = langChunkClosure(fileName, chunkImports, langChunkSet);
      }

      const manifest: ShikiLangsManifest = {
        version: 1,
        chunks,
        files,
        lookup: { ...EXTENSION_TO_FILE_FORMAT },
      };
      this.emitFile({
        type: "asset",
        fileName: SHIKI_LANGS_FILE,
        source: `${JSON.stringify(manifest)}\n`,
      });
    },
  };
}

function langChunkClosure(
  start: string,
  chunkImports: Map<string, string[]>,
  langChunks: Set<string>,
): string[] {
  const kept: string[] = [];
  const seen = new Set<string>();
  const stack = [start];
  while (stack.length > 0) {
    const current = stack.pop();
    if (current === undefined || seen.has(current)) {
      continue;
    }
    seen.add(current);
    if (langChunks.has(current)) {
      kept.push(current);
    }
    for (const imported of chunkImports.get(current) ?? []) {
      stack.push(imported);
    }
  }
  return kept;
}
