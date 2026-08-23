import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { readStoredGapStyle, writeStoredGapStyle, type GapStyle } from "./gap-style.ts";

type GapStyleContextValue = {
  gapStyle: GapStyle;
  setGapStyle: (style: GapStyle) => void;
};

const GapStyleContext = createContext<GapStyleContextValue | null>(null);

export function GapStyleProvider(props: { children: ReactNode }) {
  const [gapStyle, setGapStyleState] = useState<GapStyle>(readStoredGapStyle);

  const setGapStyle = useCallback((next: GapStyle) => {
    writeStoredGapStyle(next);
    setGapStyleState(next);
  }, []);

  const value = useMemo(() => ({ gapStyle, setGapStyle }), [gapStyle, setGapStyle]);

  return <GapStyleContext.Provider value={value}>{props.children}</GapStyleContext.Provider>;
}

export function useGapStyle(): GapStyleContextValue {
  const value = useContext(GapStyleContext);
  if (value === null) {
    throw new Error("useGapStyle must be used within GapStyleProvider");
  }
  return value;
}
