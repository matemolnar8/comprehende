import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useDefaultLayout } from "react-resizable-panels";
import { fetchHunks, fetchReview, type LiveHunk, type ReviewMeta } from "./api.ts";
import { Header } from "./components/Header.tsx";
import { Inspector, type InspectorState } from "./components/Inspector.tsx";
import { Layer } from "./components/Layer.tsx";
import { Overview } from "./components/Overview.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { WaitMark } from "./components/WaitMark.tsx";
import { waitCopy } from "./lib/wait.ts";
import { fileIndexAtHunk, filesFromHunks } from "./lib/layer-files.ts";
import { runViewTransition } from "./lib/motion.ts";
import { initialSelection, persistSelection, sameSelection, shiftSelection, type Selection } from "./lib/selection.ts";
import { colorIndexByLayerId, groupParts, isMixedReview, partColor } from "./lib/parts.ts";
import { useViewedFiles } from "./lib/use-viewed-files.ts";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";

export function App() {
  const [meta, setMeta] = useState<ReviewMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [hunks, setHunks] = useState<LiveHunk[]>([]);
  const [hunksKey, setHunksKey] = useState<string | null>(null);
  const [layerPatches, setLayerPatches] = useState<Map<string, string>>(() => new Map());
  const [hunkError, setHunkError] = useState<string | null>(null);
  const [wrap, setWrap] = useState(false);
  const [split, setSplit] = useState(false);
  const [splitRatio, setSplitRatio] = useState(0.5);
  const [activeHunk, setActiveHunk] = useState(0);
  const [inspector, setInspector] = useState<InspectorState | null>(null);
  const [loading, setLoading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "comprehende-shell-overlay",
    panelIds: ["stack", "main"],
    onlySaveAfterUserInteractions: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchReview();
      setMeta(next);
      setSelection((current) => current ?? initialSelection(next));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (meta === null || selection === null) {
      return;
    }
    persistSelection(meta, selection);
  }, [meta, selection]);

  const selectedKey =
    selection?.kind === "group" ? selection.id : selection?.kind === "unassigned" ? "unassigned" : null;

  useEffect(() => {
    if (selectedKey === null) {
      setHunks([]);
      setLayerPatches(new Map());
      setHunksKey(null);
      return;
    }
    let cancelled = false;
    setHunkError(null);
    void fetchHunks(selectedKey)
      .then((payload) => {
        if (!cancelled) {
          setHunks(payload.hunks);
          setLayerPatches(new Map(payload.files.map((file) => [file.path, file.patch])));
          setHunksKey(selectedKey);
          setActiveHunk(0);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setHunks([]);
          setLayerPatches(new Map());
          setHunksKey(selectedKey);
          setHunkError(cause instanceof Error ? cause.message : String(cause));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedKey]);

  const hunksLoading = selectedKey !== null && selectedKey !== hunksKey;

  const selectWithMotion = useCallback(
    (next: Selection) => {
      if (sameSelection(next, selection) && inspector === null) {
        return;
      }
      const kind = inspector !== null ? "scene" : "layer";
      runViewTransition(() => {
        setSelection(next);
        setInspector(null);
      }, kind);
    },
    [inspector, selection],
  );

  const openInspector = useCallback((path: string) => {
    runViewTransition(() => {
      setInspector({ path, mode: "file", side: "new" });
    }, "scene");
  }, []);

  const closeInspector = useCallback(() => {
    if (inspector === null) {
      return;
    }
    runViewTransition(() => setInspector(null), "scene");
  }, [inspector]);

  const { viewedPaths, setFileViewed } = useViewedFiles(meta?.resolved.baseSha, meta?.resolved.headSha);

  const scrollToHunk = useCallback((index: number) => {
    setActiveHunk(index);
    requestAnimationFrame(() => {
      document.querySelector(`[data-hunk="${index}"]`)?.scrollIntoView({ block: "nearest" });
    });
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.closest("input, textarea, select") !== null)
      ) {
        return;
      }
      if (event.key === "w") {
        setWrap((value) => !value);
      } else if (event.key === "s") {
        setSplit((value) => {
          if (!value) {
            setSplitRatio(0.5);
          }
          return !value;
        });
      } else if (event.key === "r") {
        void load();
      } else if (event.key === "o") {
        selectWithMotion({ kind: "overview" });
      } else if (event.key === "u") {
        selectWithMotion({ kind: "unassigned" });
      } else if (event.key === "Escape") {
        closeInspector();
      } else if (event.key === "[") {
        shiftSelection(meta, selection, selectWithMotion, -1);
      } else if (event.key === "]") {
        shiftSelection(meta, selection, selectWithMotion, 1);
      } else if (inspector !== null) {
        return;
      } else if (event.key === "j") {
        const files = filesFromHunks(hunks, layerPatches);
        const current = fileIndexAtHunk(files, activeHunk);
        const next = files[Math.min(files.length - 1, Math.max(current, 0) + 1)];
        if (next !== undefined) {
          scrollToHunk(next.firstIndex);
        }
      } else if (event.key === "k") {
        const files = filesFromHunks(hunks, layerPatches);
        const current = fileIndexAtHunk(files, activeHunk);
        const previous = files[Math.max(0, (current === -1 ? 0 : current) - 1)];
        if (previous !== undefined) {
          scrollToHunk(previous.firstIndex);
        }
      } else if (event.key === "v") {
        const files = filesFromHunks(hunks, layerPatches);
        const current = files[Math.max(0, fileIndexAtHunk(files, activeHunk))];
        if (current !== undefined) {
          setFileViewed(current.path, !viewedPaths.has(current.path));
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeHunk, closeInspector, hunks, inspector, layerPatches, load, meta, scrollToHunk, selectWithMotion, selection, setFileViewed, viewedPaths]);

  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
  }, [selection]);

  const selectedGroup = useMemo(() => {
    if (meta === null || selection?.kind !== "group") {
      return null;
    }
    return meta.groups.find((group) => group.id === selection.id) ?? null;
  }, [meta, selection]);

  const layerFiles = useMemo(() => filesFromHunks(hunks, layerPatches), [hunks, layerPatches]);
  const parts = useMemo(() => groupParts(meta?.groups ?? []), [meta]);
  const colorById = useMemo(() => colorIndexByLayerId(parts), [parts]);
  const mixed = isMixedReview(parts);
  const strandColor =
    mixed && selectedGroup !== null ? colorById.get(selectedGroup.id) : undefined;

  if (loading && meta === null) {
    return (
      <Boot>
        <p className="mb-5 font-serif text-lg leading-none text-foreground">Comprehende</p>
        <WaitMark layout="page" label={waitCopy.review} />
      </Boot>
    );
  }
  if (error !== null && meta === null) {
    return <Boot className="text-warn">{error}</Boot>;
  }
  if (meta === null) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col" aria-busy={loading || hunksLoading}>
        <Header
          meta={meta}
          wrap={wrap}
          split={split}
          onWrap={() => setWrap((value) => !value)}
          onUnified={() => setSplit(false)}
          onSplit={() => {
            setSplit(true);
            if (!split) {
              setSplitRatio(0.5);
            }
          }}
          onRefresh={() => void load()}
          busy={loading}
        />

        <ResizablePanelGroup
          className="min-h-0 flex-1"
          defaultLayout={defaultLayout}
          onLayoutChanged={onLayoutChanged}
        >
          <ResizablePanel id="stack" defaultSize="20" minSize="14%" className="min-h-0 min-w-0">
            <Sidebar meta={meta} selection={selection} parts={parts} onSelect={selectWithMotion} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel id="main" defaultSize="80" minSize="40%" className="min-h-0 min-w-0">
            <div className="review-scene h-full min-h-0">
              {inspector !== null ? (
                <Inspector
                  inspector={inspector}
                  wrap={wrap}
                  setInspector={setInspector}
                  onClose={closeInspector}
                />
              ) : (
                <main ref={mainRef} className="review-main h-full overflow-auto px-10 py-8" aria-busy={hunksLoading}>
                  {selection?.kind === "overview" ? (
                    <Overview meta={meta} parts={parts} onOpenLayer={(id) => selectWithMotion({ kind: "group", id })} />
                  ) : (
                    <Layer
                      group={selectedGroup}
                      groups={meta.groups}
                      mixed={mixed}
                      strandColor={strandColor !== undefined ? partColor(strandColor) : undefined}
                      loading={hunksLoading}
                      hunkError={hunkError}
                      files={hunksLoading ? [] : layerFiles}
                      activeHunk={activeHunk}
                      split={split}
                      splitRatio={splitRatio}
                      wrap={wrap}
                      viewedPaths={viewedPaths}
                      onOpenLayer={(id) => selectWithMotion({ kind: "group", id })}
                      onOpenFile={openInspector}
                      onSplitRatio={setSplitRatio}
                      onViewed={setFileViewed}
                    />
                  )}
                </main>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
}

function Boot(props: { children: ReactNode; className?: string }) {
  return <div className={cn("px-10 py-8 text-muted-foreground", props.className)}>{props.children}</div>;
}
