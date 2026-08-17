export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "comprehende.theme";

export const DIFF_THEMES = {
  dark: "github-dark",
  light: "github-light",
} as const;

export function parseThemePreference(raw: string | null): ThemePreference {
  if (raw === "light" || raw === "dark" || raw === "system") {
    return raw;
  }
  return "system";
}

export function resolveTheme(preference: ThemePreference, prefersDark: boolean): ResolvedTheme {
  if (preference === "system") {
    return prefersDark ? "dark" : "light";
  }
  return preference;
}

export function applyResolvedTheme(theme: ResolvedTheme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}

export function readStoredPreference(): ThemePreference {
  try {
    return parseThemePreference(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return "system";
  }
}

export function writeStoredPreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // quota / private mode
  }
}

export function systemPrefersDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
