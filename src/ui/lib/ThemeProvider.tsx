import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyResolvedTheme,
  readStoredPreference,
  resolveTheme,
  systemPrefersDark,
  writeStoredPreference,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme.ts";
import { readStoredThemeChoice, writeStoredThemeChoice, type ThemeChoice } from "./custom-theme.ts";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  system: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  /** Unset until the user picks one; `pickThemeChoice` resolves it against the review's themes. */
  themeChoice: ThemeChoice | undefined;
  setThemeChoice: (themeChoice: ThemeChoice) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider(props: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark);
  const resolved = resolveTheme(preference, prefersDark);
  const system = resolveTheme("auto", prefersDark);
  const [themeChoice, setThemeChoiceState] = useState(readStoredThemeChoice);

  const setPreference = useCallback((next: ThemePreference) => {
    writeStoredPreference(next);
    setPreferenceState(next);
  }, []);

  const setThemeChoice = useCallback((next: ThemeChoice) => {
    writeStoredThemeChoice(next);
    setThemeChoiceState(next);
  }, []);

  useEffect(() => {
    applyResolvedTheme(resolved);
  }, [resolved]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setPrefersDark(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const value = useMemo(
    () => ({ preference, resolved, system, setPreference, themeChoice, setThemeChoice }),
    [preference, resolved, system, setPreference, themeChoice, setThemeChoice],
  );

  return <ThemeContext.Provider value={value}>{props.children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return value;
}
