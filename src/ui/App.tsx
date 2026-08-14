import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useDefaultLayout } from "react-resizable-panels";
import {
  fetchBlame,
  fetchFile,
  fetchHunks,
  fetchReview,
  layerIndex,
  padLayer,
  shortSha,
  type LiveHunk,
  type ReviewMeta,
} from "./api.ts";
import { addedSymbols, hunkRangeLabel, lineDelta } from "../schema/hunk-meta.ts";
import { groupBlameRuns } from "../schema/blame-runs.ts";
import { PierreFile, PierreFileDiff } from "./PierreDiff.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";

type Selection = { kind: "overview" } | { kind: "group"; id: string } | { kind: "unassigned" };

type Inspector = {
  path: string;
  mode: "file" | "blame";
  side: "old" | "new";
};

function sizeLabel(size: ReviewMeta["document"]["size"]): string {
  return size.replace("-", " ");
}

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
  const [inspector, setInspector] = useState<Inspector | null>(null);
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
        const current = files.findIndex(
          (file) => activeHunk >= file.firstIndex && activeHunk < file.firstIndex + file.hunkCount,
        );
        const next = files[Math.min(files.length - 1, Math.max(current, 0) + 1)];
        if (next !== undefined) {
          scrollToHunk(next.firstIndex);
        }
      } else if (event.key === "k") {
        const files = filesFromHunks(hunks, layerPatches);
        const current = files.findIndex(
          (file) => activeHunk >= file.firstIndex && activeHunk < file.firstIndex + file.hunkCount,
        );
        const previous = files[Math.max(0, (current === -1 ? 0 : current) - 1)];
        if (previous !== undefined) {
          scrollToHunk(previous.firstIndex);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeHunk, hunks, inspector, layerPatches, load, meta, scrollToHunk, selection]);

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

  const incomplete = meta.coverage.unassignedCount > 0 || meta.coverage.staleCount > 0;

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-center gap-6 border-b border-border px-5 py-3">
          <span className="font-serif text-lg leading-none text-foreground">Comprehende</span>
          <div
            className="flex min-w-0 flex-1 items-baseline gap-2 text-sm"
            title={`${meta.resolved.baseSha} ... ${meta.resolved.headSha}`}
          >
            <code className="text-primary">{meta.resolved.baseRef}</code>
            <span className="text-muted-foreground">...</span>
            <code className="text-primary">{meta.resolved.headRef}</code>
            <span className="font-mono text-[11px] text-muted-foreground">
              {shortSha(meta.resolved.baseSha)} → {shortSha(meta.resolved.headSha)}
            </span>
          </div>
          <Coverage meta={meta} incomplete={incomplete} />
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={wrap ? "secondary" : "outline"}
                  aria-pressed={wrap}
                  aria-label="Wrap lines"
                  onClick={() => setWrap((value) => !value)}
                >
                  Wrap
                  <Kbd>w</Kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Wrap long lines</TooltipContent>
            </Tooltip>
            <div className="flex items-center gap-1.5">
              <div className="flex overflow-hidden rounded-md border border-input">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={split ? "ghost" : "secondary"}
                      className="rounded-none border-0"
                      onClick={() => setSplit(false)}
                      aria-pressed={!split}
                    >
                      Unified
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Unified diff</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={split ? "secondary" : "ghost"}
                      className="rounded-none border-0"
                      onClick={() => {
                        setSplit(true);
                        if (!split) {
                          setSplitRatio(0.5);
                        }
                      }}
                      aria-pressed={split}
                    >
                      Split
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Side-by-side diff</TooltipContent>
                </Tooltip>
              </div>
              <Kbd>s</Kbd>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => void load()}>
                  Refresh
                  <Kbd>r</Kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reload live git</TooltipContent>
            </Tooltip>
          </div>
        </header>

        <ResizablePanelGroup
          className="min-h-0 flex-1"
          defaultLayout={defaultLayout}
          onLayoutChanged={onLayoutChanged}
        >
          <ResizablePanel id="stack" defaultSize="20" minSize="14%" className="min-h-0 min-w-0">
            <nav className="h-full overflow-auto py-6">
              <ul className="mb-6 list-none p-0">
                <li>
                  <StackItem
                    active={selection?.kind === "overview"}
                    onClick={() => setSelection({ kind: "overview" })}
                    title="Overview"
                    count={sizeLabel(meta.document.size)}
                  />
                </li>
              </ul>
              <ul className="mb-6 list-none p-0">
                {meta.groups.map((group, index) => (
                  <li key={group.id}>
                    <StackItem
                      active={selection?.kind === "group" && selection.id === group.id}
                      onClick={() => setSelection({ kind: "group", id: group.id })}
                      index={padLayer(index + 1)}
                      title={group.title}
                      count={group.staleCount > 0 ? `${group.staleCount} stale` : undefined}
                    />
                  </li>
                ))}
                {meta.unassigned.hunkCount > 0 ? (
                  <li>
                    <StackItem
                      active={selection?.kind === "unassigned"}
                      onClick={() => setSelection({ kind: "unassigned" })}
                      title="Unassigned"
                      count={String(meta.unassigned.hunkCount)}
                      warn
                    />
                  </li>
                ) : null}
              </ul>
              {meta.document.tickets !== undefined && meta.document.tickets.length > 0 ? (
                <ul className="space-y-2 px-4 text-sm text-muted-foreground">
                  {meta.document.tickets.map((ticket) => (
                    <li key={ticket.id}>
                      {ticket.url !== undefined ? (
                        <a className="text-primary hover:underline" href={ticket.url} target="_blank" rel="noreferrer">
                          {ticket.id}
                          {ticket.title !== undefined ? ` ${ticket.title}` : ""}
                        </a>
                      ) : (
                        <span>
                          {ticket.id}
                          {ticket.title !== undefined ? ` ${ticket.title}` : ""}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : null}
            </nav>
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
                    <div className="mt-8 space-y-8">
                      {layerFiles.map((file) => (
                        <HunkView
                          key={file.path}
                          file={file}
                          active={activeHunk >= file.firstIndex && activeHunk < file.firstIndex + file.hunkCount}
                          index={file.firstIndex}
                          split={split}
                          splitRatio={splitRatio}
                          wrap={wrap}
                          onSplitRatio={setSplitRatio}
                          onOpen={(path) => setInspector({ path, mode: "file", side: "new" })}
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

function Kbd(props: { children: string }) {
  return <kbd className="font-mono text-[10px] font-normal text-muted-foreground">{props.children}</kbd>;
}

function Coverage(props: { meta: ReviewMeta; incomplete: boolean }) {
  const { meta, incomplete } = props;
  const detail = [
    `${meta.coverage.assignedHunks} of ${meta.coverage.totalHunks} hunks grouped`,
    meta.coverage.unassignedCount > 0 ? `${meta.coverage.unassignedCount} unassigned` : null,
    meta.coverage.staleCount > 0 ? `${meta.coverage.staleCount} stale` : null,
  ]
    .filter((part) => part !== null)
    .join(" · ");
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn("font-mono text-xs tabular-nums", incomplete ? "text-warn" : "text-muted-foreground")}
        >
          {meta.coverage.assignedHunks}/{meta.coverage.totalHunks}
        </span>
      </TooltipTrigger>
      <TooltipContent>{detail}</TooltipContent>
    </Tooltip>
  );
}

function StackItem(props: {
  active: boolean;
  onClick: () => void;
  title: string;
  count?: string;
  index?: string;
  warn?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={props.onClick}
      className={cn(
        "mx-3 mb-1 h-auto w-[calc(100%-24px)] min-w-0 items-start justify-start gap-2.5 rounded-md px-3 py-2 text-left font-normal whitespace-normal",
        props.active && "bg-secondary text-foreground",
        props.warn && "text-warn hover:text-warn",
      )}
    >
      {props.index !== undefined ? (
        <span className="mt-px w-5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">{props.index}</span>
      ) : null}
      <span className="min-w-0 flex-1 text-left leading-snug">{props.title}</span>
      {props.count !== undefined ? (
        <span className={cn("shrink-0 text-[11px] tabular-nums text-muted-foreground", props.warn && "text-warn")}>
          {props.count}
        </span>
      ) : null}
    </Button>
  );
}

function defaultSelection(meta: ReviewMeta): Selection {
  if (meta.groups.length > 0) {
    return { kind: "overview" };
  }
  return { kind: "unassigned" };
}

function shiftSelection(
  meta: ReviewMeta | null,
  selection: Selection | null,
  setSelection: (selection: Selection) => void,
  delta: number,
): void {
  if (meta === null) {
    return;
  }
  const ids: Selection[] = [{ kind: "overview" }, ...meta.groups.map((group) => ({ kind: "group" as const, id: group.id }))];
  if (meta.unassigned.hunkCount > 0) {
    ids.push({ kind: "unassigned" });
  }
  const current = ids.findIndex((item) => sameSelection(item, selection));
  const next = ids[(current + delta + ids.length) % ids.length];
  if (next !== undefined) {
    setSelection(next);
  }
}

function sameSelection(a: Selection, b: Selection | null): boolean {
  if (b === null) {
    return false;
  }
  if (a.kind === "overview") {
    return b.kind === "overview";
  }
  if (a.kind === "unassigned") {
    return b.kind === "unassigned";
  }
  return b.kind === "group" && b.id === a.id;
}

function Brief(props: { kicker?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 max-w-[68ch]">
      {props.kicker !== undefined ? (
        <p className="mb-2 font-mono text-[11px] tracking-wide text-muted-foreground">{props.kicker}</p>
      ) : null}
      <h1 className="mb-3 font-serif text-[1.75rem] leading-snug text-foreground">{props.title}</h1>
      {props.children}
    </div>
  );
}

function Overview(props: { meta: ReviewMeta; onOpenLayer: (id: string) => void }) {
  const { meta, onOpenLayer } = props;
  return (
    <div className="mb-8 max-w-[68ch]">
      {meta.document.walkthrough !== undefined ? (
        <h1 className="mb-4 font-serif text-[1.75rem] leading-snug text-foreground">{meta.document.walkthrough}</h1>
      ) : (
        <h1 className="mb-4 font-serif text-[1.75rem] leading-snug text-foreground">Overview</h1>
      )}
      <p className="mb-10 text-muted-foreground">
        {sizeLabel(meta.document.size)} · {meta.files.length} files
      </p>
      <ol className="m-0 list-none p-0">
        {meta.groups.map((group, index) => (
          <li key={group.id} className="mb-2">
            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full min-w-0 items-start justify-start gap-3 px-3 py-3 text-left font-normal whitespace-normal"
              onClick={() => onOpenLayer(group.id)}
            >
              <span className="mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                {padLayer(index + 1)}
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block font-medium text-foreground">{group.title}</strong>
                <span className="mt-1 block leading-relaxed text-muted-foreground">{group.summary}</span>
              </span>
            </Button>
          </li>
        ))}
      </ol>
      {meta.commits.length > 0 ? (
        <ul className="mt-12 space-y-2 text-sm text-muted-foreground">
          {meta.commits.map((commit) => (
            <li key={commit.sha}>
              <code className="text-primary">{commit.shortSha}</code> {commit.subject}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function LayerBrief(props: {
  group: ReviewMeta["groups"][number];
  index: number;
  groups: ReviewMeta["groups"];
  onOpenLayer: (id: string) => void;
}) {
  const { group, index, groups, onOpenLayer } = props;
  return (
    <Brief kicker={padLayer(index)} title={group.title}>
      <p className="mb-5 font-serif text-lg leading-relaxed text-foreground">{group.summary}</p>
      {group.dependsOn.length > 0 ? (
        <p className="mb-5 text-muted-foreground">
          Depends on{" "}
          {group.dependsOn.map((id, i) => {
            const dep = groups.find((item) => item.id === id);
            const label = dep !== undefined ? `${padLayer(layerIndex(groups, id))} ${dep.title}` : id;
            return (
              <span key={id}>
                {i > 0 ? ", " : ""}
                <Button type="button" variant="link" className="h-auto p-0" onClick={() => onOpenLayer(id)}>
                  {label}
                </Button>
              </span>
            );
          })}
        </p>
      ) : null}
      {group.lookFor.length > 0 ? (
        <ul className="mb-2 list-disc space-y-2 pl-5 leading-relaxed">
          {group.lookFor.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {group.staleCount > 0 ? (
        <p className="mt-4 text-warn">
          {group.staleCount} hunk ref{group.staleCount === 1 ? "" : "s"} no longer match live git. Git wins; the pointer
          is flagged, not replaced.
        </p>
      ) : null}
    </Brief>
  );
}

type LayerFile = {
  path: string;
  oldPath?: string;
  patch: string;
  added: number;
  removed: number;
  hunkCount: number;
  firstIndex: number;
  hunks: LiveHunk[];
};

function filesFromHunks(hunks: LiveHunk[], patches: Map<string, string>): LayerFile[] {
  const map = new Map<string, LayerFile>();
  hunks.forEach((hunk, index) => {
    const delta = lineDelta(hunk.lines);
    const existing = map.get(hunk.path);
    if (existing === undefined) {
      map.set(hunk.path, {
        path: hunk.path,
        oldPath: hunk.oldPath,
        patch: patches.get(hunk.path) ?? "",
        added: delta.added,
        removed: delta.removed,
        hunkCount: 1,
        firstIndex: index,
        hunks: [hunk],
      });
      return;
    }
    existing.added += delta.added;
    existing.removed += delta.removed;
    existing.hunkCount += 1;
    existing.hunks.push(hunk);
  });
  return [...map.values()];
}

function HunkView(props: {
  file: LayerFile;
  active: boolean;
  index: number;
  split: boolean;
  splitRatio: number;
  wrap: boolean;
  onSplitRatio: (ratio: number) => void;
  onOpen: (path: string) => void;
}) {
  const { file, active, index, split, splitRatio, wrap, onSplitRatio, onOpen } = props;
  const first = file.hunks[0];
  const symbols = addedSymbols(
    file.hunks.flatMap((hunk) => hunk.lines.filter((line) => line.kind === "add").map((line) => line.text)),
  );
  const label = file.oldPath !== undefined ? `${file.oldPath} → ${file.path}` : file.path;
  return (
    <article
      className={cn("overflow-hidden rounded-lg border bg-card", active ? "border-primary" : "border-border")}
      data-hunk={index}
    >
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border bg-card px-4 py-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" variant="link" className="h-auto p-0 font-mono text-sm" onClick={() => onOpen(file.path)}>
              {label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open file</TooltipContent>
        </Tooltip>
        <code className="font-mono text-xs text-muted-foreground">
          {file.hunkCount === 1 && first !== undefined ? hunkRangeLabel(first.header) : `${file.hunkCount} hunks`}
        </code>
        <span className="ml-auto font-mono text-[11px] tabular-nums">
          <span className="text-del">−{file.removed}</span> <span className="text-add">+{file.added}</span>
        </span>
        {symbols.length > 0
          ? symbols.map((name) => (
              <Badge key={name} variant="outline" className="font-mono font-normal">
                {name}
              </Badge>
            ))
          : null}
      </header>
      <PierreFileDiff
        patch={file.patch}
        split={split}
        wrap={wrap}
        splitRatio={splitRatio}
        onSplitRatio={onSplitRatio}
      />
    </article>
  );
}

function Inspector(props: {
  inspector: Inspector;
  wrap: boolean;
  setInspector: (inspector: Inspector) => void;
  onClose: () => void;
}) {
  const { inspector, wrap, setInspector, onClose } = props;
  const [content, setContent] = useState<string>("");
  const [blame, setBlame] = useState<{ author: string; line: number; text: string; sha: string; timestamp: number }[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const blameContents = useMemo(
    () => (blame === null ? "" : blame.map((line) => line.text).join("\n")),
    [blame],
  );
  const blameAnnotations = useMemo(() => {
    if (blame === null) {
      return undefined;
    }
    return groupBlameRuns(blame).map((run) => ({
      lineNumber: run.lineNumber,
      metadata: {
        sha: run.sha,
        author: run.author,
        timestamp: run.timestamp,
        lines: run.lines,
      },
    }));
  }, [blame]);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setLoading(true);
    setContent("");
    setBlame(null);
    if (inspector.mode === "file") {
      void fetchFile(inspector.path, inspector.side)
        .then((payload) => {
          if (!cancelled) {
            setContent(payload.content);
            setLoading(false);
          }
        })
        .catch((cause: unknown) => {
          if (!cancelled) {
            setError(cause instanceof Error ? cause.message : String(cause));
            setLoading(false);
          }
        });
    } else {
      void fetchBlame(inspector.path, inspector.side)
        .then((payload) => {
          if (!cancelled) {
            setBlame(payload.lines);
            setLoading(false);
          }
        })
        .catch((cause: unknown) => {
          if (!cancelled) {
            setError(cause instanceof Error ? cause.message : String(cause));
            setLoading(false);
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [inspector]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex flex-wrap items-center gap-3 px-8 pt-6 pb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="sm" variant="outline" onClick={onClose}>
              Back
              <Kbd>esc</Kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Back to the diff</TooltipContent>
        </Tooltip>
        <strong className="min-w-0 truncate font-mono text-sm font-medium">{inspector.path}</strong>
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant={inspector.mode === "file" ? "secondary" : "ghost"}
            onClick={() => setInspector({ ...inspector, mode: "file" })}
          >
            File
          </Button>
          <Button
            type="button"
            size="sm"
            variant={inspector.mode === "blame" ? "secondary" : "ghost"}
            onClick={() => setInspector({ ...inspector, mode: "blame" })}
          >
            Blame
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button
            type="button"
            size="sm"
            variant={inspector.side === "old" ? "secondary" : "ghost"}
            onClick={() => setInspector({ ...inspector, side: "old" })}
          >
            Old
          </Button>
          <Button
            type="button"
            size="sm"
            variant={inspector.side === "new" ? "secondary" : "ghost"}
            onClick={() => setInspector({ ...inspector, side: "new" })}
          >
            New
          </Button>
        </div>
      </div>
      {error !== null ? <p className="px-8 text-warn">{error}</p> : null}
      {loading && error === null ? <p className="px-8 text-sm text-muted-foreground">Reading git…</p> : null}
      {inspector.mode === "file" && error === null && !loading ? (
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-8">
          <PierreFile path={inspector.path} contents={content} wrap={wrap} />
        </div>
      ) : null}
      {inspector.mode === "blame" && error === null && !loading && blame !== null ? (
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-8">
          <PierreFile path={inspector.path} contents={blameContents} wrap={wrap} annotations={blameAnnotations} />
        </div>
      ) : null}
    </div>
  );
}
