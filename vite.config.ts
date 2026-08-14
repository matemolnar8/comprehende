import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

const uiRoot = fileURLToPath(new URL("./src/ui", import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  root: uiRoot,
  base: "/",
  resolve: {
    alias: {
      "@": uiRoot,
    },
  },
  build: {
    outDir: fileURLToPath(new URL("./dist/ui", import.meta.url)),
    emptyOutDir: true,
  },
});
