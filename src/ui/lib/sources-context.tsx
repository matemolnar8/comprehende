import { createContext, useContext, type ReactNode } from "react";
import type { Source } from "../../schema/types.ts";
import type { Selection } from "./selection.ts";

export type SourcesHandle = {
  byId: Map<string, Source>;
  staleIds: Set<string>;
  onCite: (source: Source) => void;
  onOpenSource: (source: Source) => void;
  selectionForSource: (source: Source) => Selection;
};

const SourcesContext = createContext<SourcesHandle | null>(null);

export function SourcesProvider(props: { value: SourcesHandle; children: ReactNode }) {
  return <SourcesContext.Provider value={props.value}>{props.children}</SourcesContext.Provider>;
}

export function useSources(): SourcesHandle | null {
  return useContext(SourcesContext);
}
