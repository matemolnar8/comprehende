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
  applyMonoFont,
  nextMonoFont,
  readStoredMonoFont,
  writeStoredMonoFont,
  type MonoFont,
} from "./mono-font.ts";

type MonoFontContextValue = {
  font: MonoFont;
  toggleMonoFont: () => void;
};

const MonoFontContext = createContext<MonoFontContextValue | null>(null);

export function MonoFontProvider(props: { children: ReactNode }) {
  const [font, setFont] = useState<MonoFont>(readStoredMonoFont);

  const toggleMonoFont = useCallback(() => {
    setFont((current) => {
      const next = nextMonoFont(current);
      writeStoredMonoFont(next);
      return next;
    });
  }, []);

  useEffect(() => {
    applyMonoFont(font);
  }, [font]);

  const value = useMemo(() => ({ font, toggleMonoFont }), [font, toggleMonoFont]);

  return <MonoFontContext.Provider value={value}>{props.children}</MonoFontContext.Provider>;
}

export function useMonoFont(): MonoFontContextValue {
  const value = useContext(MonoFontContext);
  if (value === null) {
    throw new Error("useMonoFont must be used within MonoFontProvider");
  }
  return value;
}
