import { defineConfig, lazyPlugins } from "vite-plus";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { shikiLangChunks } from "./vite-shiki-langs.ts";

const uiRoot = fileURLToPath(new URL("./src/ui", import.meta.url));
// Test files live outside the UI build root, so test globs anchor at the repo root.
const repoRoot = fileURLToPath(new URL("./", import.meta.url)).replaceAll("\\", "/");

export default defineConfig({
  fmt: {
    // Generator-owned schema copies. Tests require byte equality with
    // `pnpm generate:schema` output, so the formatter leaves them alone.
    ignorePatterns: [
      "src/schema/review.schema.json",
      "skills-next/comprehende/references/review.schema.json",
      "skills/comprehende/references/review.schema.json",
      ".agents/skills/comprehende/references/review.schema.json",
    ],
  },
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
  plugins: lazyPlugins(() => [react(), tailwindcss(), shikiLangChunks()]),
  test: {
    dir: repoRoot,
    include: [`${repoRoot}src/**/*.test.ts`, `${repoRoot}scripts/**/*.test.ts`],
    // Fixture-heavy tests (example repos, static export) outlast the default 5s timeout.
    testTimeout: 30000,
  },
  staged: {
    "*": "vp check --fix",
  },
  root: uiRoot,
  base: "./",
  resolve: {
    alias: {
      "@": uiRoot,
    },
  },
  optimizeDeps: {
    include: ["@pierre/diffs", "@pierre/diffs/react"],
  },
  worker: {
    format: "es",
  },
  build: {
    outDir: fileURLToPath(new URL("./dist/ui", import.meta.url)),
    emptyOutDir: true,
  },
});
