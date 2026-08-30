import { createContext, useContext, type ReactNode } from "react";
import type { Source } from "../../schema/types.ts";

export type SourcesHandle = {
  byId: Map<string, Source>;
  staleIds: Set<string>;
  onCite: (source: Source) => void;
};

const SourcesContext = createContext<SourcesHandle | null>(null);

export function SourcesProvider(props: { value: SourcesHandle; children: ReactNode }) {
  return <SourcesContext.Provider value={props.value}>{props.children}</SourcesContext.Provider>;
}

export function useSources(): SourcesHandle | null {
  return useContext(SourcesContext);
}
