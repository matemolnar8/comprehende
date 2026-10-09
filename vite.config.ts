import { defineConfig, lazyPlugins } from "vite-plus";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { shikiLangChunks } from "./vite-shiki-langs.ts";

const uiRoot = fileURLToPath(new URL("./src/ui", import.meta.url));

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
