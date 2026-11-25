import type { ThemeSource } from "../../api/theme.ts";
import type { Theme } from "../../schema/theme.ts";
import { readKey, writeKey } from "./storage.ts";

/** Which colours the UI shows: a theme file's, or the built-in ones. */
export type ThemeChoice = ThemeSource | "default";

export const THEME_CHOICE_STORAGE_KEY = "comprehende.theme-choice";

const STORED_CHOICES = ["project", "user", "default"] as const satisfies readonly ThemeChoice[];

export function parseThemeChoice(raw: string | null): ThemeChoice | undefined {
  return STORED_CHOICES.find((themeChoice) => themeChoice === raw);
}

/** The stored themeChoice when the review has it, else the first theme: the project's, then the user's. */
export function pickThemeChoice(
  themes: readonly { source: ThemeSource }[],
  stored: ThemeChoice | undefined,
): ThemeChoice {
  if (stored === "default") {
    return stored;
  }
  return (themes.find((theme) => theme.source === stored) ?? themes[0])?.source ?? "default";
}

export function readStoredThemeChoice(): ThemeChoice | undefined {
  return parseThemeChoice(readKey(localStorage, THEME_CHOICE_STORAGE_KEY));
}

export function writeStoredThemeChoice(themeChoice: ThemeChoice): void {
  writeKey(localStorage, THEME_CHOICE_STORAGE_KEY, themeChoice);
}

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
