import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDefaultLayout } from "react-resizable-panels";
import { fetchHunks, fetchReview, layerIndex, type LiveHunk, type ReviewMeta } from "./api.ts";
import { Header } from "./components/Header.tsx";
import { HunkView } from "./components/HunkView.tsx";
import { Inspector, type InspectorState } from "./components/Inspector.tsx";
import { Brief, LayerBrief } from "./components/LayerBrief.tsx";
import { Overview } from "./components/Overview.tsx";
import { Sidebar } from "./components/Sidebar.tsx";
import { fileIndexAtHunk, filesFromHunks } from "./lib/layer-files.ts";
import { defaultSelection, shiftSelection, type Selection } from "./lib/selection.ts";
import { useViewedFiles } from "./lib/use-viewed-files.ts";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable.tsx";
import { TooltipProvider } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";

export function App() {
  const [meta, setMeta] = useState<ReviewMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [hunks, setHunks] = useState<LiveHunk[]>([]);
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
      setSelection((current) => current ?? defaultSelection(next));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedKey =
    selection?.kind === "group" ? selection.id : selection?.kind === "unassigned" ? "unassigned" : null;

  useEffect(() => {
    if (selectedKey === null) {
      setHunks([]);
      setLayerPatches(new Map());
      return;
    }
    let cancelled = false;
    setHunkError(null);
    void fetchHunks(selectedKey)
      .then((payload) => {
        if (!cancelled) {
          setHunks(payload.hunks);
          setLayerPatches(new Map(payload.files.map((file) => [file.path, file.patch])));
          setActiveHunk(0);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setHunks([]);
          setLayerPatches(new Map());
          setHunkError(cause instanceof Error ? cause.message : String(cause));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedKey]);

  useEffect(() => {
    setInspector(null);
  }, [selection]);

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
        setSelection({ kind: "overview" });
      } else if (event.key === "u") {
        setSelection({ kind: "unassigned" });
      } else if (event.key === "Escape") {
        setInspector(null);
      } else if (event.key === "[") {
        shiftSelection(meta, selection, setSelection, -1);
      } else if (event.key === "]") {
        shiftSelection(meta, selection, setSelection, 1);
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
  }, [activeHunk, hunks, inspector, layerPatches, load, meta, scrollToHunk, selection, setFileViewed, viewedPaths]);

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

  if (loading && meta === null) {
    return <Boot>Reading git…</Boot>;
  }
  if (error !== null && meta === null) {
    return <Boot className="text-warn">{error}</Boot>;
  }
  if (meta === null) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col">
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
        />

        <ResizablePanelGroup
          className="min-h-0 flex-1"
          defaultLayout={defaultLayout}
          onLayoutChanged={onLayoutChanged}
        >
          <ResizablePanel id="stack" defaultSize="20" minSize="14%" className="min-h-0 min-w-0">
            <Sidebar meta={meta} selection={selection} onSelect={setSelection} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel id="main" defaultSize="80" minSize="40%" className="min-h-0 min-w-0">
            {inspector !== null ? (
              <Inspector
                inspector={inspector}
                wrap={wrap}
                setInspector={setInspector}
                onClose={() => setInspector(null)}
              />
            ) : (
              <main ref={mainRef} className="h-full overflow-auto px-10 py-8">
                {selection?.kind === "overview" ? (
                  <Overview meta={meta} onOpenLayer={(id) => setSelection({ kind: "group", id })} />
                ) : selection?.kind === "unassigned" ? (
                  <Brief kicker="Unassigned" title="Not in any layer">
                    <p className="font-serif text-lg leading-relaxed text-foreground">
                      These hunks are in git and in no layer. Fix the review document — never the diff.
                    </p>
                  </Brief>
                ) : selectedGroup !== null ? (
                  <LayerBrief
                    group={selectedGroup}
                    index={layerIndex(meta.groups, selectedGroup.id)}
                    groups={meta.groups}
                    onOpenLayer={(id) => setSelection({ kind: "group", id })}
                  />
                ) : (
                  <h1 className="font-serif text-2xl">Select a layer</h1>
                )}
                {hunkError !== null ? <p className="mt-4 text-warn">{hunkError}</p> : null}
                {selection?.kind !== "overview" ? (
                  <>
                    {hunks.length === 0 && hunkError === null ? (
                      <p className="mt-8 text-muted-foreground">No hunks in this layer.</p>
                    ) : null}
                    {layerFiles.length > 0 ? (
                      <p className="mt-8 font-mono text-xs tabular-nums text-muted-foreground">
                        {layerFiles.filter((file) => viewedPaths.has(file.path)).length} of {layerFiles.length} files viewed
                      </p>
                    ) : null}
                    <div className={layerFiles.length > 0 ? "mt-4 space-y-8" : "mt-8 space-y-8"}>
                      {layerFiles.map((file) => (
                        <HunkView
                          key={file.path}
                          file={file}
                          active={activeHunk >= file.firstIndex && activeHunk < file.firstIndex + file.hunkCount}
                          index={file.firstIndex}
                          split={split}
                          splitRatio={splitRatio}
                          wrap={wrap}
                          viewed={viewedPaths.has(file.path)}
                          onSplitRatio={setSplitRatio}
                          onOpen={(path) => setInspector({ path, mode: "file", side: "new" })}
                          onViewed={setFileViewed}
                        />
                      ))}
                    </div>
                  </>
                ) : null}
              </main>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
}

function Boot(props: { children: string; className?: string }) {
  return <div className={cn("p-16 text-muted-foreground", props.className)}>{props.children}</div>;
}
