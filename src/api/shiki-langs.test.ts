import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, describe, it } from "node:test";
import { rmSync } from "node:fs";
import {
  chunksToKeep,
  highlightLangFromPath,
  highlightLangsForPaths,
  highlightPathsFromFiles,
  parseShikiLangsManifest,
  pruneUnusedHighlighterChunks,
  shikiLangId,
  type ShikiLangsManifest,
} from "./shiki-langs.ts";

const roots: string[] = [];

after(() => {
  for (const root of roots) {
    rmSync(root, { recursive: true, force: true });
  }
});

const manifest: ShikiLangsManifest = {
  version: 1,
  chunks: [
    "assets/shiki-lang-typescript-aaa.js",
    "assets/shiki-lang-javascript-bbb.js",
    "assets/shiki-lang-css-ccc.js",
    "assets/shiki-lang-html-ddd.js",
    "assets/shiki-lang-python-eee.js",
    "assets/shiki-lang-markdown-fff.js",
  ],
  files: {
    typescript: ["assets/shiki-lang-typescript-aaa.js"],
    javascript: ["assets/shiki-lang-javascript-bbb.js"],
    css: ["assets/shiki-lang-css-ccc.js"],
    html: ["assets/shiki-lang-html-ddd.js", "assets/shiki-lang-javascript-bbb.js", "assets/shiki-lang-css-ccc.js"],
    python: ["assets/shiki-lang-python-eee.js"],
    markdown: ["assets/shiki-lang-markdown-fff.js"],
  },
  lookup: {
    ts: "typescript",
    mts: "typescript",
    js: "javascript",
    html: "html",
    css: "css",
    py: "python",
    md: "markdown",
    Dockerfile: "dockerfile",
    "component.ts": "angular-ts",
  },
};

describe("highlighter manifest", () => {
  it("parses a v1 manifest and rejects junk", () => {
    assert.deepEqual(parseShikiLangsManifest(manifest), manifest);
    assert.equal(parseShikiLangsManifest({ version: 2, chunks: [], files: {}, lookup: {} }), undefined);
    assert.equal(parseShikiLangsManifest({ version: 1, chunks: ["a"], files: { ts: "nope" }, lookup: {} }), undefined);
    assert.equal(parseShikiLangsManifest(null), undefined);
  });

  it("reads language ids from shiki module paths", () => {
    assert.equal(
      shikiLangId("/x/node_modules/@shikijs/langs/dist/typescript.mjs"),
      "typescript",
    );
    assert.equal(
      shikiLangId("C:\\x\\node_modules\\@shikijs\\langs\\dist\\html-derivative.mjs"),
      "html-derivative",
    );
    assert.equal(shikiLangId("/x/node_modules/@pierre/diffs/dist/index.js"), undefined);
  });

  it("matches Pierre's filename lookup, including compound extensions", () => {
    assert.equal(highlightLangFromPath("src/app.ts", manifest.lookup), "typescript");
    assert.equal(highlightLangFromPath("src\\app.mts", manifest.lookup), "typescript");
    assert.equal(highlightLangFromPath("widget/component.ts", manifest.lookup), "angular-ts");
    assert.equal(highlightLangFromPath("Dockerfile", manifest.lookup), "dockerfile");
    assert.equal(highlightLangFromPath("notes.md", manifest.lookup), "markdown");
    assert.equal(highlightLangFromPath("assets/shot.png", manifest.lookup), undefined);
  });

  it("collects languages from new and old paths", () => {
    const paths = highlightPathsFromFiles([
      { path: "src/app.ts" },
      { path: "web/index.html", oldPath: "web/index.css" },
    ]);
    assert.deepEqual(highlightLangsForPaths(paths, manifest.lookup).sort(), ["css", "html", "typescript"]);
  });

  it("keeps static embeds and refuses to prune when a used language is missing", () => {
    assert.deepEqual(
      chunksToKeep(manifest, ["html"])?.sort(),
      ["assets/shiki-lang-css-ccc.js", "assets/shiki-lang-html-ddd.js", "assets/shiki-lang-javascript-bbb.js"],
    );
    assert.equal(chunksToKeep(manifest, ["html", "rust"]), undefined);
    assert.deepEqual(chunksToKeep(manifest, []), []);
  });
});

describe("pruneUnusedHighlighterChunks", () => {
  it("deletes unused highlighter files and their maps", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-shiki-"));
    roots.push(root);
    await mkdir(join(root, "assets"));
    await writeFile(join(root, "shiki-langs.json"), `${JSON.stringify(manifest)}\n`);
    for (const file of manifest.chunks) {
      await writeFile(join(root, file), `// ${file}\n`);
      await writeFile(join(root, `${file}.map`), "{}\n");
    }

    const removed = await pruneUnusedHighlighterChunks(root, ["src/app.ts", "README.md"]);
    assert.equal(existsSync(join(root, "assets/shiki-lang-typescript-aaa.js")), true);
    assert.equal(existsSync(join(root, "assets/shiki-lang-markdown-fff.js")), true);
    assert.equal(existsSync(join(root, "assets/shiki-lang-python-eee.js")), false);
    assert.equal(existsSync(join(root, "assets/shiki-lang-python-eee.js.map")), false);
    assert.equal(existsSync(join(root, "assets/shiki-lang-html-ddd.js")), false);
    assert.ok(removed.includes("assets/shiki-lang-python-eee.js"));
  });

  it("leaves the folder alone when the manifest is missing", async () => {
    const root = await mkdtemp(join(tmpdir(), "comprehende-shiki-none-"));
    roots.push(root);
    await writeFile(join(root, "index.html"), "<!doctype html>\n");
    const removed = await pruneUnusedHighlighterChunks(root, ["src/app.ts"]);
    assert.deepEqual(removed, []);
    assert.equal(existsSync(join(root, "index.html")), true);
  });
});
