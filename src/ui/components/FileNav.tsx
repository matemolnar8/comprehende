import { useEffect, useRef, useState, type RefObject } from "react";
import {
  CheckIcon,
  ChevronRightIcon,
  FileIcon,
  PanelRightCloseIcon,
  PanelRightOpenIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import {
  fileBasename,
  fileDirname,
  initialRailCollapsed,
  RAIL_NARROW_QUERY,
  readStoredRailCollapsed,
  repeatedNameFolders,
  scrollDeltaToShow,
  writeStoredRailCollapsed,
} from "../lib/file-nav.ts";
import {
  fileIndexAtHunk,
  IMAGE_STATUS,
  IMAGE_TONE_CLASS,
  type GroupFile,
} from "../lib/group-files.ts";
import { readingStatus } from "../lib/reading-progress.ts";
import { isPureRelocation, relocationWord } from "../lib/relocation.ts";
import { useScrollEdges } from "../lib/scroll-edges.ts";
import { DiffStat } from "./DiffStat.tsx";
import { Kbd } from "./Kbd.tsx";
import { labelText, scrollFade, splitStacked } from "./Kicker.tsx";
import { ReadingMark } from "./ReadingMark.tsx";

// Up to this many chips wrap onto rows, so each chip shows whole. More scroll in one row.
const STRIP_WRAP_MAX = 6;

export function FileStrip(props: {
  files: GroupFile[];
  activeHunk: number;
  viewedPaths: ReadonlySet<string>;
  onSelect: (index: number) => void;
  children: React.ReactNode;
}) {
  const { files, activeHunk, viewedPaths } = props;
  const activeIndex = Math.max(0, fileIndexAtHunk(files, activeHunk));
  const paths = files.map((file) => file.path);
  const folders = repeatedNameFolders(paths);
  const wrap = files.length <= STRIP_WRAP_MAX;
  const stripRef = useRef<HTMLElement>(null);
  useScrollEdges(stripRef, "x");
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2">
        <h2 className={cn("m-0 tabular-nums", labelText)}>Files · {files.length}</h2>
        <ReadingMark paths={paths} viewed={viewedPaths} />
      </div>
      <div className="relative -mx-4 mb-4">
        <nav
          ref={stripRef}
          aria-label="Files in group"
          className={cn(
            "peer border-y border-border bg-card",
            !wrap &&
              "snap-x snap-mandatory scroll-px-3 overflow-x-auto [scrollbar-width:none] data-more:[mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),rgb(0_0_0/0.5))]",
          )}
        >
          <ul className={cn("flex gap-1 py-2 pl-3", wrap ? "flex-wrap pr-3" : "pr-10")}>
            {files.map((file, i) => {
              const viewed = viewedPaths.has(file.path);
              const active = i === activeIndex;
              const word = relocationWord(file);
              const folder = folders[i];
              return (
                <li key={file.path} className={wrap ? "min-w-0" : "shrink-0 snap-start"}>
                  <button
                    type="button"
                    onClick={() => props.onSelect(file.firstIndex)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs leading-tight",
                      wrap ? "max-w-full" : "max-w-[12rem]",
                      "border",
                      active
                        ? "border-transparent bg-accent text-foreground"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {viewed ? <CheckIcon aria-label="Viewed" className="size-3 shrink-0" /> : null}
                    {word !== undefined ? <span className="shrink-0">{word}</span> : null}
                    <span className="flex min-w-0 font-mono">
                      {folder !== undefined ? (
                        <span className="shrink-0 text-muted-foreground">{folder}</span>
                      ) : null}
                      <span className="truncate">{fileBasename(file.path)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        {wrap ? null : (
          <ChevronRightIcon
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-2 hidden size-4 -translate-y-1/2 rounded-full bg-card text-muted-foreground shadow-[0_0_8px_6px_var(--card)] peer-data-more:block"
          />
        )}
      </div>
      <div className="flex flex-col gap-5">{props.children}</div>
    </div>
  );
}

function FileCounters(props: { file: GroupFile }) {
  const { file } = props;
  const word = relocationWord(file);
  const pure = isPureRelocation(file);
  if (file.kind === "image" && word === undefined) {
    const status = IMAGE_STATUS[file.status];
    return (
      <span className={cn("shrink-0 text-xs", IMAGE_TONE_CLASS[status.tone])}>{status.label}</span>
    );
  }
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-xs tabular-nums">
      {word !== undefined ? (
        <span className="text-muted-foreground">
          {word}
          {file.relocation?.similarity !== undefined ? ` ${file.relocation.similarity}%` : null}
        </span>
      ) : null}
      {pure || file.kind === "image" ? null : (
        <DiffStat removed={file.removed} added={file.added} />
      )}
    </span>
  );
}

export function FileRail(props: {
  files: GroupFile[];
  activeHunk: number;
  viewedPaths: ReadonlySet<string>;
  onSelect: (index: number) => void;
  children: React.ReactNode;
}) {
  const { files, activeHunk, viewedPaths } = props;
  const activeIndex = Math.max(0, fileIndexAtHunk(files, activeHunk));
  const filePaths = files.map((file) => file.path);
  const reading = readingStatus(filePaths, viewedPaths);
  const railRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(() => {
    let search = "";
    try {
      search = window.location.search;
    } catch {
      // ignore a missing location
    }
    let stored: boolean | null = null;
    try {
      stored = readStoredRailCollapsed();
    } catch {
      // private mode: no stored choice
    }
    let narrowRail = false;
    try {
      narrowRail = window.matchMedia(RAIL_NARROW_QUERY).matches;
    } catch {
      // no matchMedia: stay expanded
    }
    return initialRailCollapsed(search, stored, narrowRail);
  });

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      writeStoredRailCollapsed(next);
    } catch {
      // quota / private mode: rail state stays in memory
    }
    try {
      const url = new URL(window.location.href);
      if (next) url.searchParams.set("rail", "collapsed");
      else url.searchParams.delete("rail");
      window.history.replaceState(null, "", url);
    } catch {
      // ignore history failures, rail state stays in memory
    }
  };

  useActiveRowInView(railRef, activeIndex, collapsed);

  if (collapsed) {
    return (
      <div className="flex min-h-0 gap-3 max-sm:flex-col">
        <div className="flex min-w-0 flex-1 flex-col gap-5">{props.children}</div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Show the files in this group"
              onClick={toggle}
              className={cn(
                "sticky top-4 flex h-8 shrink-0 items-center gap-1.5 self-start rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 max-sm:hidden",
                splitStacked,
              )}
            >
              <PanelRightOpenIcon className="size-4" />
              <span className="text-foreground">Files</span>
              {reading === null ? null : (
                <span className="tabular-nums">
                  {reading.viewed}/{reading.total}
                </span>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">Show the files in this group</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 gap-3 max-sm:flex-col">
      <div className="flex min-w-0 flex-1 flex-col gap-5">{props.children}</div>
      <nav
        aria-label={reading === null ? "Files" : `Files, ${reading.filesLabel}`}
        className={cn(
          "sticky top-4 flex max-h-[calc(100vh-7rem)] w-[13rem] shrink-0 flex-col self-start overflow-hidden rounded-lg border border-border bg-card shadow-card max-[1100px]:w-[11rem] max-sm:h-auto max-sm:max-h-[40vh] max-sm:w-full",
          splitStacked,
        )}
      >
        <div className="flex items-center gap-2 border-b border-border py-1.5 pr-1.5 pl-3">
          <FilesHeading count={files.length} className="min-w-0 flex-1 truncate" />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon-sm"
                variant="ghost"
                className="size-7 shrink-0 text-muted-foreground"
                aria-label="Hide the file list"
                onClick={toggle}
              >
                <PanelRightCloseIcon className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hide the file list</TooltipContent>
          </Tooltip>
        </div>
        <div ref={railRef} className="flex-1 overflow-auto px-1 py-2">
          <FileRows
            files={files}
            activeIndex={activeIndex}
            viewedPaths={viewedPaths}
            onSelect={props.onSelect}
          />
        </div>
      </nav>
    </div>
  );
}

function FilesHeading(props: { count: number; className?: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <h2 className={cn("m-0 cursor-default tabular-nums", labelText, props.className)}>
          Files · {props.count}
        </h2>
      </TooltipTrigger>
      <TooltipContent className="flex items-center gap-1.5">
        Next and previous file
        <Kbd>j</Kbd>
        <Kbd>k</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}

function FileRows(props: {
  files: GroupFile[];
  activeIndex: number;
  viewedPaths: ReadonlySet<string>;
  onSelect: (index: number) => void;
}) {
  const repeated = repeatedNameFolders(props.files.map((file) => file.path));
  return (
    <ul className="m-0 list-none space-y-0.5 p-0">
      {props.files.map((file, i) => {
        const viewed = props.viewedPaths.has(file.path);
        const active = i === props.activeIndex;
        const folder =
          file.oldPath !== undefined ? `← ${fileBasename(file.oldPath)}` : fileDirname(file.path);
        // A rename subtitle is the old name, not a folder, so it has no folder to highlight.
        const sharedFolder = file.oldPath === undefined ? repeated[i] : undefined;
        return (
          <li key={file.path} className="snap-start">
            <button
              type="button"
              data-file-row={i}
              title={file.path}
              onClick={() => props.onSelect(file.firstIndex)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "relative flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                active
                  ? "bg-accent text-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <FileIcon aria-hidden className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-baseline gap-2">
                  <span
                    className={cn(
                      "flex min-w-0 flex-1 font-mono text-xs leading-5",
                      viewed ? "text-muted-foreground" : "text-foreground",
                    )}
                  >
                    <span className="min-w-0 truncate">{fileBasename(file.path)}</span>
                  </span>
                  <FileCounters file={file} />
                </span>
                {folder !== undefined ? (
                  <span className="flex min-w-0 font-mono text-xs leading-4 text-muted-foreground">
                    {sharedFolder === undefined ? (
                      <span className="min-w-0 truncate">{folder}</span>
                    ) : (
                      <>
                        <span className="min-w-0 truncate">
                          {folder.slice(0, folder.length - sharedFolder.length + 1)}
                        </span>
                        <span className="shrink-0 font-semibold text-foreground">
                          {sharedFolder.slice(0, -1)}
                        </span>
                      </>
                    )}
                  </span>
                ) : null}
              </span>
              {viewed ? (
                <CheckIcon aria-label="Viewed" className="mt-1 size-3.5 shrink-0 text-primary" />
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/** The files of a group in the sticky context column. Wide stages only; see `splitWide`. */
export function FileList(props: {
  files: GroupFile[];
  activeHunk: number;
  viewedPaths: ReadonlySet<string>;
  onSelect: (index: number) => void;
  className?: string;
}) {
  const { files, activeHunk, viewedPaths } = props;
  const activeIndex = Math.max(0, fileIndexAtHunk(files, activeHunk));
  const paths = files.map((file) => file.path);
  const reading = readingStatus(paths, viewedPaths);
  const listRef = useRef<HTMLDivElement>(null);
  useActiveRowInView(listRef, activeIndex);
  useScrollEdges(listRef);
  return (
    <nav
      aria-label={reading === null ? "Files" : `Files, ${reading.filesLabel}`}
      className={cn("min-h-32 flex-1 flex-col", props.className)}
    >
      <div className="mb-1.5 flex shrink-0 items-center gap-2">
        <FilesHeading count={files.length} />
        <ReadingMark paths={paths} viewed={viewedPaths} />
      </div>
      {/* Pull rows left so names align with the label; never right, or the sticky column scrolls sideways. */}
      <div
        ref={listRef}
        className={cn(
          "-ml-2 min-h-0 flex-1 snap-y snap-proximity overflow-y-auto overscroll-contain [scrollbar-color:var(--border)_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin]",
          scrollFade,
        )}
      >
        <FileRows
          files={files}
          activeIndex={activeIndex}
          viewedPaths={viewedPaths}
          onSelect={props.onSelect}
        />
      </div>
    </nav>
  );
}

/** Scrolls only the list, never the page or the sticky column around it. */
function useActiveRowInView(
  listRef: RefObject<HTMLElement | null>,
  activeIndex: number,
  collapsed = false,
) {
  useEffect(() => {
    const list = listRef.current;
    if (list === null) {
      return;
    }
    const rows = [...list.querySelectorAll("[data-file-row]")];
    const row = rows[activeIndex];
    if (row !== undefined) {
      list.scrollTop += scrollDeltaToShow(
        list.getBoundingClientRect(),
        row.getBoundingClientRect(),
        rows.map((item) => item.getBoundingClientRect().top),
      );
    }
  }, [activeIndex, collapsed, listRef]);
}
