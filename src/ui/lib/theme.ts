import { readKey, writeKey } from "./storage.ts";

export type ThemePreference = "light" | "dark" | "auto";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "comprehende.theme";

export const DIFF_THEMES = {
  dark: "github-dark",
  light: "github-light",
} as const;

export function parseThemePreference(raw: string | null): ThemePreference {
  if (raw === "light" || raw === "dark" || raw === "auto") {
    return raw;
  }
  if (raw === "system") {
    return "auto";
  }
  return "auto";
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  if (preference === "auto") {
    return prefersDark ? "dark" : "light";
  }
  return preference;
}

export function applyResolvedTheme(theme: ResolvedTheme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function readStoredPreference(): ThemePreference {
  return parseThemePreference(readKey(localStorage, THEME_STORAGE_KEY));
}

export function writeStoredPreference(preference: ThemePreference): void {
  writeKey(localStorage, THEME_STORAGE_KEY, preference);
}

export function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
