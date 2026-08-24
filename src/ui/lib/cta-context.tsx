import { createContext, useContext, useState, type ReactNode } from "react";
import { readCtaId, writeCtaId, type CtaId } from "./cta.ts";

const CtaContext = createContext<{ cta: CtaId; setCta: (id: CtaId) => void } | null>(null);

export function CtaProvider(props: { children: ReactNode }) {
  const [cta, setCtaState] = useState<CtaId>(readCtaId);
  const setCta = (id: CtaId): void => {
    setCtaState(id);
    writeCtaId(id);
  };
  return <CtaContext.Provider value={{ cta, setCta }}>{props.children}</CtaContext.Provider>;
}

export function useCta(): { cta: CtaId; setCta: (id: CtaId) => void } {
  const value = useContext(CtaContext);
  if (value === null) {
    throw new Error("useCta requires CtaProvider");
  }
  return value;
}
