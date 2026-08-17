import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  applyResolvedTheme,
  readStoredPreference,
  resolveTheme,
  systemPrefersDark,
  writeStoredPreference,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme.ts";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider(props: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);
  const [prefersDark, setPrefersDark] = useState(systemPrefersDark);
  const resolved = resolveTheme(preference, prefersDark);

  const setPreference = useCallback((next: ThemePreference) => {
    writeStoredPreference(next);
    setPreferenceState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setPreference(resolved === "dark" ? "light" : "dark");
  }, [resolved, setPreference]);

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
    () => ({ preference, resolved, setPreference, toggleTheme }),
    [preference, resolved, setPreference, toggleTheme],
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
