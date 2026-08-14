import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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
import { highlightLine } from "./highlight.ts";
import { addedSymbols, hunkRangeLabel, lineDelta } from "../schema/hunk-meta.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Toggle } from "@/components/ui/toggle.tsx";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";

type Selection = { kind: "overview" } | { kind: "group"; id: string } | { kind: "unassigned" };

type Inspector = {
  path: string;
  mode: "file" | "blame";
  side: "old" | "new";
};

const EFFORT: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "trivial",
  2: "small",
  3: "medium",
  4: "large",
  5: "very large",
};

export function App() {
  const [meta, setMeta] = useState<ReviewMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [hunks, setHunks] = useState<LiveHunk[]>([]);
  const [hunkError, setHunkError] = useState<string | null>(null);
  const [wrap, setWrap] = useState(false);
  const [activeHunk, setActiveHunk] = useState(0);
  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [loading, setLoading] = useState(true);
  const { defaultLayout, onLayoutChanged } = useDefaultLayout({
    id: "comprehende-shell",
    panelIds: ["stack", "main", "rail"],
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
      return;
    }
    let cancelled = false;
    setHunkError(null);
    void fetchHunks(selectedKey)
      .then((payload) => {
        if (!cancelled) {
          setHunks(payload.hunks);
          setActiveHunk(0);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setHunks([]);
          setHunkError(cause instanceof Error ? cause.message : String(cause));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedKey]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "w") {
        setWrap((value) => !value);
      } else if (event.key === "r") {
        void load();
      } else if (event.key === "o") {
        setSelection({ kind: "overview" });
      } else if (event.key === "u") {
        setSelection({ kind: "unassigned" });
      } else if (event.key === "Escape") {
        setInspector(null);
      } else if (event.key === "j") {
        setActiveHunk((value) => Math.min(Math.max(0, hunks.length - 1), value + 1));
      } else if (event.key === "k") {
        setActiveHunk((value) => Math.max(0, value - 1));
      } else if (event.key === "[") {
        shiftSelection(meta, selection, setSelection, -1);
      } else if (event.key === "]") {
        shiftSelection(meta, selection, setSelection, 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hunks.length, load, meta, selection]);

  useEffect(() => {
    document.querySelector(`[data-hunk="${activeHunk}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeHunk]);

  const selectedGroup = useMemo(() => {
    if (meta === null || selection?.kind !== "group") {
      return null;
    }
    return meta.groups.find((group) => group.id === selection.id) ?? null;
  }, [meta, selection]);

  if (loading && meta === null) {
    return <Boot>Reading git…</Boot>;
  }
  if (error !== null && meta === null) {
    return <Boot className="text-warn">{error}</Boot>;
  }
  if (meta === null) {
    return null;
  }

  const coverageRatio = meta.coverage.totalHunks === 0 ? 1 : meta.coverage.assignedHunks / meta.coverage.totalHunks;
  const incomplete = meta.coverage.unassignedCount > 0 || meta.coverage.staleCount > 0;
  const highlightFiles = new Set(
    selectedGroup?.files ?? (selection?.kind === "unassigned" ? meta.unassigned.files : []),
  );

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-center gap-4 border-b border-border bg-card px-3 py-2">
          <div className="flex min-w-52 flex-col">
            <span className="font-serif text-base leading-none text-foreground">Comprehende</span>
            <span className="mt-1 text-[11px] text-muted-foreground">diffs from git · groups are interpretation</span>
          </div>
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
          <div className={cn("min-w-56 text-xs", incomplete ? "text-warn" : "text-add")}>
            <span>
              {meta.coverage.assignedHunks}/{meta.coverage.totalHunks} hunks grouped
              {meta.coverage.unassignedCount > 0 ? ` · ${meta.coverage.unassignedCount} unassigned` : ""}
              {meta.coverage.staleCount > 0 ? ` · ${meta.coverage.staleCount} stale` : ""}
            </span>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn("h-full", incomplete ? "bg-warn" : "bg-add")}
                style={{ width: `${Math.round(coverageRatio * 100)}%` }}
              />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Toggle size="sm" variant="outline" pressed={wrap} onPressedChange={setWrap} aria-label="Wrap lines">
                  Wrap
                </Toggle>
              </TooltipTrigger>
              <TooltipContent>Wrap long lines (w)</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="outline" onClick={() => void load()}>
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reload live git (r)</TooltipContent>
            </Tooltip>
          </div>
        </header>

        <ResizablePanelGroup
          className="min-h-0 flex-1"
          defaultLayout={defaultLayout}
          onLayoutChanged={onLayoutChanged}
        >
          <ResizablePanel id="stack" defaultSize="22" minSize="14%" className="min-h-0">
            <nav className="h-full overflow-auto bg-card py-3">
              <PaneLabel>Stack</PaneLabel>
              <ul className="mb-3 list-none p-0">
                <li>
                  <StackItem
                    active={selection?.kind === "overview"}
                    onClick={() => setSelection({ kind: "overview" })}
                    title="Overview"
                    count={EFFORT[meta.effort.score]}
                  />
                </li>
              </ul>
              <ul className="mb-3 list-none p-0">
                {meta.groups.map((group, index) => (
                  <li key={group.id}>
                    <StackItem
                      active={selection?.kind === "group" && selection.id === group.id}
                      onClick={() => setSelection({ kind: "group", id: group.id })}
                      index={padLayer(index + 1)}
                      title={group.title}
                      count={`${group.files.length}f${group.staleCount > 0 ? ` · ${group.staleCount} stale` : ""}`}
                    />
                  </li>
                ))}
                <li>
                  <StackItem
                    active={selection?.kind === "unassigned"}
                    onClick={() => setSelection({ kind: "unassigned" })}
                    title="Unassigned"
                    count={String(meta.unassigned.hunkCount)}
                    warn
                  />
                </li>
              </ul>
              {meta.document.tickets !== undefined && meta.document.tickets.length > 0 ? (
                <section>
                  <PaneLabel>Tickets</PaneLabel>
                  <ul className="space-y-1.5 px-3 text-xs text-muted-foreground">
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
                </section>
              ) : null}
            </nav>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel id="main" defaultSize="56" minSize="30%" className="min-h-0">
            <main className="h-full overflow-auto px-6 py-5">
              {selection?.kind === "overview" ? (
                <Overview meta={meta} onOpenLayer={(id) => setSelection({ kind: "group", id })} />
              ) : selection?.kind === "unassigned" ? (
                <Brief kicker="Unassigned" title="Not in any layer">
                  <p className="font-serif text-[17px] leading-snug text-foreground">
                    Live git still has these hunks, and no group points at them. Coverage cannot hide. Fix the review
                    document — never the diff.
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
                <h1 className="font-serif text-xl">Select a layer</h1>
              )}
              {hunkError !== null ? <p className="mt-3 text-warn">{hunkError}</p> : null}
              {selection?.kind !== "overview" ? (
                <>
                  {hunks.length === 0 && hunkError === null ? (
                    <p className="mt-4 text-muted-foreground">No hunks in this layer.</p>
                  ) : null}
                  <div className={cn("mt-4 space-y-4", wrap && "hunks-wrap")}>
                    {hunks.map((hunk, index) => (
                      <HunkView
                        key={`${hunk.path}:${hunk.oldStart}:${hunk.newStart}`}
                        hunk={hunk}
                        active={index === activeHunk}
                        index={index}
                        onOpen={(path) => setInspector({ path, mode: "file", side: "new" })}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </main>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel id="rail" defaultSize="22" minSize="14%" className="min-h-0">
            <aside className="h-full overflow-auto bg-card py-3">
              {inspector !== null ? (
                <Inspector inspector={inspector} setInspector={setInspector} onClose={() => setInspector(null)} />
              ) : selection?.kind === "group" && hunks.length > 0 ? (
                <FileRail hunks={hunks} active={activeHunk} onSelect={setActiveHunk} />
              ) : (
                <FileTree
                  files={meta.files}
                  skipped={meta.skipped}
                  highlight={highlightFiles}
                  onOpen={(path) => setInspector({ path, mode: "file", side: "new" })}
                />
              )}
            </aside>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </TooltipProvider>
  );
}

function Boot(props: { children: string; className?: string }) {
  return <div className={cn("p-12 text-muted-foreground", props.className)}>{props.children}</div>;
}

function PaneLabel(props: { children: string }) {
  return (
    <h2 className="mb-2 px-3 text-[11px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
      {props.children}
    </h2>
  );
}

function StackItem(props: {
  active: boolean;
  onClick: () => void;
  title: string;
  count: string;
  index?: string;
  warn?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={props.onClick}
      className={cn(
        "mx-2 mb-0.5 h-auto w-[calc(100%-16px)] justify-start gap-2 rounded-md px-2 py-1.5 font-normal",
        props.active && "bg-secondary text-foreground",
        props.warn && "text-warn hover:text-warn",
      )}
    >
      {props.index !== undefined ? (
        <span className="w-5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">{props.index}</span>
      ) : null}
      <span className="min-w-0 flex-1 truncate text-left">{props.title}</span>
      <span className={cn("text-[11px] tabular-nums text-muted-foreground", props.warn && "text-warn")}>
        {props.count}
      </span>
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
  ids.push({ kind: "unassigned" });
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

function Brief(props: { kicker: string; title: string; children: ReactNode }) {
  return (
    <div className="mb-5 max-w-[72ch]">
      <p className="mb-1.5 text-[11px] tracking-[0.04em] text-muted-foreground uppercase">{props.kicker}</p>
      <h1 className="mb-2 font-serif text-[22px] leading-tight text-foreground">{props.title}</h1>
      {props.children}
    </div>
  );
}

function Overview(props: { meta: ReviewMeta; onOpenLayer: (id: string) => void }) {
  const { meta, onOpenLayer } = props;
  return (
    <Brief kicker="Overview" title="Review stack">
      {meta.document.walkthrough !== undefined ? (
        <p className="mb-3 font-serif text-[17px] leading-snug text-foreground">{meta.document.walkthrough}</p>
      ) : null}
      <p className="mb-3 text-muted-foreground">
        Review effort {meta.effort.score}/5 · {EFFORT[meta.effort.score]} · {meta.effort.files} files · {meta.effort.hunks}{" "}
        hunks
      </p>
      <h2 className="mt-5 mb-2 text-[11px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
        Read in this order
      </h2>
      <ol className="m-0 list-none p-0">
        {meta.groups.map((group, index) => (
          <li key={group.id} className="mb-1.5">
            <Button
              type="button"
              variant="secondary"
              className="h-auto w-full justify-start gap-2.5 px-3 py-2 text-left font-normal"
              onClick={() => onOpenLayer(group.id)}
            >
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{padLayer(index + 1)}</span>
              <span>
                <strong className="font-medium text-foreground">{group.title}</strong>
                <span className="text-muted-foreground"> {group.summary}</span>
              </span>
            </Button>
          </li>
        ))}
      </ol>
      <h2 className="mt-5 mb-2 text-[11px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
        Files by layer
      </h2>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="pb-1 text-left font-medium text-muted-foreground">Layer</th>
            <th className="pb-1 text-left font-medium text-muted-foreground">Path</th>
            <th className="pb-1 text-left font-medium text-muted-foreground">Hunks</th>
          </tr>
        </thead>
        <tbody>
          {meta.groups.flatMap((group, index) =>
            group.files.map((path) => (
              <tr key={`${group.id}:${path}`} className="border-t border-border">
                <td className="py-1 pr-2 font-mono tabular-nums">{padLayer(index + 1)}</td>
                <td className="py-1 pr-2">{path}</td>
                <td className="py-1 font-mono tabular-nums">
                  {meta.files.find((file) => file.path === path)?.hunkCount ?? ""}
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
      {meta.commits.length > 0 ? (
        <>
          <h2 className="mt-5 mb-2 text-[11px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
            Commits
          </h2>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {meta.commits.map((commit) => (
              <li key={commit.sha}>
                <code className="text-primary">{commit.shortSha}</code> {commit.subject}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </Brief>
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
    <Brief
      kicker={`Layer ${padLayer(index)} · ${group.files.length} file${group.files.length === 1 ? "" : "s"} · ${group.hunkCount} hunk${group.hunkCount === 1 ? "" : "s"}`}
      title={group.title}
    >
      <p className="mb-3 font-serif text-[17px] leading-snug text-foreground">{group.summary}</p>
      {group.dependsOn.length > 0 ? (
        <p className="mb-3 text-muted-foreground">
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
        <>
          <h2 className="mt-4 mb-2 text-[11px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
            Look for
          </h2>
          <ul className="mb-4 list-disc space-y-1.5 pl-4">
            {group.lookFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
      {group.staleCount > 0 ? (
        <p className="text-warn">
          {group.staleCount} hunk ref{group.staleCount === 1 ? "" : "s"} no longer match live git. Git wins; the pointer
          is flagged, not replaced.
        </p>
      ) : null}
    </Brief>
  );
}

function filesFromHunks(hunks: LiveHunk[]): {
  path: string;
  oldPath?: string;
  added: number;
  removed: number;
  hunkCount: number;
  firstIndex: number;
}[] {
  const map = new Map<
    string,
    { path: string; oldPath?: string; added: number; removed: number; hunkCount: number; firstIndex: number }
  >();
  hunks.forEach((hunk, index) => {
    const delta = lineDelta(hunk.lines);
    const existing = map.get(hunk.path);
    if (existing === undefined) {
      map.set(hunk.path, {
        path: hunk.path,
        oldPath: hunk.oldPath,
        added: delta.added,
        removed: delta.removed,
        hunkCount: 1,
        firstIndex: index,
      });
      return;
    }
    existing.added += delta.added;
    existing.removed += delta.removed;
    existing.hunkCount += 1;
  });
  return [...map.values()];
}

function FileRail(props: { hunks: LiveHunk[]; active: number; onSelect: (index: number) => void }) {
  const files = filesFromHunks(props.hunks);
  const activePath = props.hunks[props.active]?.path;
  return (
    <>
      <PaneLabel>Files in this layer</PaneLabel>
      <ul className="list-none p-0">
        {files.map((file) => (
          <li key={file.path} className="mb-0.5">
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "mx-2 h-auto w-[calc(100%-16px)] flex-col items-stretch gap-0.5 rounded-md px-2 py-1.5 font-normal",
                file.path === activePath && "bg-secondary text-foreground",
              )}
              onClick={() => props.onSelect(file.firstIndex)}
            >
              <span className="flex w-full items-baseline gap-2">
                <span className="min-w-0 flex-1 truncate text-left">
                  {file.oldPath !== undefined ? `${file.oldPath} → ${file.path}` : file.path}
                </span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums">
                  <span className="text-del">−{file.removed}</span>{" "}
                  <span className="text-add">+{file.added}</span>
                </span>
              </span>
              <span className="text-left text-[11px] text-muted-foreground">
                {file.hunkCount} hunk{file.hunkCount === 1 ? "" : "s"}
              </span>
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
}

function HunkView(props: { hunk: LiveHunk; active: boolean; index: number; onOpen: (path: string) => void }) {
  const { hunk, active, index, onOpen } = props;
  const symbols = addedSymbols(hunk.lines.filter((line) => line.kind === "add").map((line) => line.text));
  const delta = lineDelta(hunk.lines);
  return (
    <article
      className={cn("overflow-hidden rounded-lg border bg-card", active ? "border-primary" : "border-border")}
      data-hunk={index}
    >
      <header className="sticky top-0 z-10 flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-border bg-card px-3 py-2">
        <Button type="button" variant="link" className="h-auto p-0 font-mono text-sm" onClick={() => onOpen(hunk.path)}>
          {hunk.oldPath !== undefined ? `${hunk.oldPath} → ${hunk.path}` : hunk.path}
        </Button>
        <code className="font-mono text-xs text-muted-foreground">{hunkRangeLabel(hunk.header)}</code>
        <span className="ml-auto font-mono text-[11px] tabular-nums">
          <span className="text-del">−{delta.removed}</span> <span className="text-add">+{delta.added}</span>
        </span>
        {symbols.length > 0
          ? symbols.map((name) => (
              <Badge key={name} variant="outline" className="font-mono font-normal">
                {name}
              </Badge>
            ))
          : null}
      </header>
      <table className="hunk-table">
        <tbody>
          {hunk.lines.map((line, lineIndex) => (
            <tr key={lineIndex} className={line.kind}>
              <td className="num">{line.oldNumber ?? ""}</td>
              <td className="num">{line.newNumber ?? ""}</td>
              <td className="sign">{line.kind === "add" ? "+" : line.kind === "del" ? "-" : " "}</td>
              <td className="code">
                <code dangerouslySetInnerHTML={{ __html: highlightLine(line.text, hunk.language) }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

function FileTree(props: {
  files: ReviewMeta["files"];
  skipped: ReviewMeta["skipped"];
  highlight: Set<string>;
  onOpen: (path: string) => void;
}) {
  return (
    <>
      <PaneLabel>Files in the live diff</PaneLabel>
      <ul className="list-none p-0">
        {props.files.map((file) => (
          <li key={file.path}>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "mx-2 mb-0.5 h-auto w-[calc(100%-16px)] justify-start gap-2 px-2 py-1.5 font-normal",
                props.highlight.has(file.path) && "bg-secondary",
              )}
              onClick={() => props.onOpen(file.path)}
              disabled={file.binary}
            >
              <span
                className={cn(
                  "w-3 font-semibold",
                  file.status === "added" && "text-add",
                  file.status === "deleted" && "text-del",
                  file.status === "renamed" && "text-primary",
                )}
              >
                {file.status[0]?.toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 truncate text-left">
                {file.oldPath !== undefined ? `${file.oldPath} → ${file.path}` : file.path}
              </span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {file.binary ? "binary" : file.hunkCount}
              </span>
            </Button>
          </li>
        ))}
      </ul>
      {props.skipped.length > 0 ? (
        <p className="px-3 text-xs text-muted-foreground">Binary files are skipped in the hunk index.</p>
      ) : null}
    </>
  );
}

function Inspector(props: {
  inspector: Inspector;
  setInspector: (inspector: Inspector) => void;
  onClose: () => void;
}) {
  const { inspector, setInspector, onClose } = props;
  const [content, setContent] = useState<string>("");
  const [blame, setBlame] = useState<{ author: string; line: number; text: string; sha: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    if (inspector.mode === "file") {
      void fetchFile(inspector.path, inspector.side)
        .then((payload) => {
          if (!cancelled) {
            setContent(payload.content);
            setBlame(null);
          }
        })
        .catch((cause: unknown) => {
          if (!cancelled) {
            setError(cause instanceof Error ? cause.message : String(cause));
          }
        });
    } else {
      void fetchBlame(inspector.path, inspector.side)
        .then((payload) => {
          if (!cancelled) {
            setBlame(payload.lines);
          }
        })
        .catch((cause: unknown) => {
          if (!cancelled) {
            setError(cause instanceof Error ? cause.message : String(cause));
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [inspector]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 px-2">
        <Button type="button" size="sm" variant="outline" onClick={onClose}>
          Back
        </Button>
        <strong className="min-w-0 truncate text-xs">{inspector.path}</strong>
      </div>
      <div className="flex gap-1 px-2 py-2">
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
      {error !== null ? <p className="px-3 text-warn">{error}</p> : null}
      {inspector.mode === "file" && error === null ? (
        <pre className="flex-1 overflow-auto p-2 font-mono text-[11px]">{content}</pre>
      ) : null}
      {inspector.mode === "blame" && blame !== null ? (
        <table className="w-full flex-1 border-collapse overflow-auto p-2 text-[11px]">
          <tbody>
            {blame.map((line) => (
              <tr key={line.line}>
                <td className="pr-2 text-right align-top whitespace-nowrap text-muted-foreground">{line.line}</td>
                <td className="pr-2 align-top whitespace-nowrap text-muted-foreground">{line.sha.slice(0, 7)}</td>
                <td className="pr-2 align-top whitespace-nowrap text-muted-foreground">{line.author}</td>
                <td className="align-top">
                  <code>{line.text}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}
