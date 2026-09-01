import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { shikiLangChunks } from "./vite-shiki-langs.ts";

const uiRoot = fileURLToPath(new URL("./src/ui", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss(), shikiLangChunks()],
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
