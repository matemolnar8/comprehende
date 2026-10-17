import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/iosevka/400.css";
import "@fontsource/iosevka/500.css";
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import { App } from "./App.tsx";
import { PierreDiffPool } from "./PierreDiff.tsx";
import { ThemeProvider } from "./lib/ThemeProvider.tsx";
import { MonoFontProvider } from "./lib/MonoFontProvider.tsx";
import "./styles.css";

const root = document.getElementById("root");
if (root === null) {
  throw new Error("missing #root");
}
createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <MonoFontProvider>
        <PierreDiffPool>
          <App />
        </PierreDiffPool>
      </MonoFontProvider>
    </ThemeProvider>
  </StrictMode>,
);
