import type { Theme } from "../../schema/theme.ts";

/**
 * Adopts a sheet that sets the theme's variables over `styles.css`. Each mode's selector is more
 * specific than the built-in `:root` and `.dark`, so a light value never shows in dark mode.
 * Returns the cleanup.
 */
export function applyCustomTheme(theme: Theme): () => void {
  const sheet = new CSSStyleSheet();
  const rules: [string, Record<string, string | undefined>][] = [
    [":root", { radius: theme.radius }],
    [":root:not(.dark)", theme.light ?? {}],
    [":root.dark", theme.dark ?? {}],
  ];
  for (const [selector, values] of rules) {
    const index = sheet.insertRule(`${selector} {}`, sheet.cssRules.length);
    const rule = sheet.cssRules[index];
    if (!(rule instanceof CSSStyleRule)) {
      continue;
    }
    for (const [token, value] of Object.entries(values)) {
      if (value !== undefined) {
        rule.style.setProperty(`--${token}`, value);
      }
    }
  }
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
  return () => {
    document.adoptedStyleSheets = document.adoptedStyleSheets.filter((item) => item !== sheet);
  };
}
