import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronRightIcon, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import {
  fileBasename,
  fileDirname,
  initialRailCollapsed,
  RAIL_NARROW_QUERY,
  readStoredRailCollapsed,
  writeStoredRailCollapsed,
} from "../lib/file-nav.ts";
import { fileIndexAtHunk } from "../lib/group-files.ts";
import type { GroupFile } from "../lib/group-files.ts";
import { readingStatus } from "../lib/reading-progress.ts";
import { isPureRelocation, relocationWord } from "../lib/relocation.ts";
import { ReadingMark } from "./ReadingMark.tsx";

export function FileStrip(props: {
  files: GroupFile[];
  activeHunk: number;
  viewedPaths: ReadonlySet<string>;
  onSelect: (index: number) => void;
  children: React.ReactNode;
}) {
  const { files, activeHunk, viewedPaths } = props;
  const activeIndex = Math.max(0, fileIndexAtHunk(files, activeHunk));
  return (
    <div className="mt-3">
      <nav aria-label="Files in group" className="-mx-4 mb-4 overflow-x-auto border-y border-border bg-card">
        <ul className="flex gap-1 px-3 py-2">
          {files.map((file, i) => {
            const viewed = viewedPaths.has(file.path);
            const active = i === activeIndex;
            const word = relocationWord(file);
            return (
              <li key={file.path} className="shrink-0">
                <button
                  type="button"
                  onClick={() => props.onSelect(file.firstIndex)}
                  className={cn(
                    "max-w-[11rem] truncate rounded-md px-2 py-1 font-mono text-[11px] leading-tight",
                    active ? "bg-accent text-foreground" : "text-muted-foreground",
                    viewed && !active && "opacity-60",
                  )}
                >
                  {word !== undefined ? `${word} ` : null}
                  {fileBasename(file.path)}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="flex flex-col">{props.children}</div>
    </div>
  );
}

function FileCounters(props: { file: GroupFile }) {
  const { file } = props;
  const word = relocationWord(file);
  const pure = isPureRelocation(file);
  if (file.kind === "image" && word === undefined) {
    return <span className="font-mono text-[11px] text-muted-foreground">{file.status}</span>;
  }
  return (
    <span className="font-mono text-[11px] tabular-nums">
      {word !== undefined ? <span className="text-muted-foreground">{word}</span> : null}
      {pure || file.kind === "image" ? null : (
        <>
          {word !== undefined ? " " : null}
          <span className="text-del">−{file.removed}</span> <span className="text-add">+{file.added}</span>
        </>
      )}
      {word !== undefined && file.relocation?.similarity !== undefined ? (
        <span className="text-muted-foreground"> {file.relocation.similarity}%</span>
      ) : null}
    </span>
  );
}

export function FileRail(props: {
  files: GroupFile[];
  activeHunk: number;
  viewedPaths: ReadonlySet<string>;
  onSelect: (index: number) => void;
  onViewed: (path: string, viewed: boolean) => void;
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

  useEffect(() => {
    const el = railRef.current?.querySelector(`[data-rail="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [activeIndex]);

  if (collapsed) {
    return (
      <div className="mt-4 flex min-h-0 gap-0 max-sm:flex-col">
        <div className="min-w-0 flex-1">{props.children}</div>
        <div className="sticky top-4 flex h-[calc(100vh-8rem)] shrink-0 self-start flex-col items-center gap-3 border-l border-border bg-card py-3" style={{ width: "44px" }}>
          <Button size="icon-sm" variant="ghost" className="size-7" aria-label="Expand file list" onClick={toggle}>
            <ChevronRightIcon className="size-4 rotate-180" />
          </Button>
          <div className="font-mono text-[10px] leading-none text-muted-foreground [writing-mode:vertical-lr]">
            {reading === null ? `${files.length} files` : reading.label}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex min-h-0 gap-3 max-sm:flex-col">
      <div className="min-w-0 flex-1">{props.children}</div>
      <nav
        ref={railRef}
        aria-label={reading === null ? "Files in group" : `Files in group, ${reading.filesLabel}`}
        className="sticky top-4 flex h-[calc(100vh-7rem)] w-[13rem] shrink-0 flex-col self-start overflow-hidden rounded-lg border border-border bg-card shadow-card max-[1099px]:w-[11rem] max-sm:h-auto max-sm:max-h-[40vh] max-sm:w-full"
      >
        <div className="flex items-center gap-2 border-b border-border px-2 py-1.5">
          <p className="flex-1 font-mono text-[11px] tabular-nums text-muted-foreground">
            {reading === null ? null : <ReadingMark paths={filePaths} viewed={viewedPaths} noun className="mt-0" />}
          </p>
          <Button size="icon-sm" variant="ghost" className="size-7 shrink-0" aria-label="Collapse file list" onClick={toggle}>
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <ul className="space-y-0.5 px-1">
            {files.map((file, i) => {
              const viewed = viewedPaths.has(file.path);
              const active = i === activeIndex;
              return (
                <li key={file.path}>
                  <button
                    data-rail={i}
                    onClick={() => props.onSelect(file.firstIndex)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-md px-1.5 py-1.5 text-left transition-colors",
                      active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <FileIcon className="mt-0.5 size-3.5 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate font-mono text-xs leading-tight", viewed && "opacity-60")}>
                        {fileBasename(file.path)}
                      </span>
                      {file.oldPath !== undefined ? (
                        <span className="block truncate font-mono text-[10px] leading-tight opacity-50">
                          ← {fileBasename(file.oldPath)}
                        </span>
                      ) : fileDirname(file.path) ? (
                        <span className="block truncate font-mono text-[10px] leading-tight opacity-50">
                          {fileDirname(file.path)}
                        </span>
                      ) : null}
                      <span className="mt-0.5 flex items-center gap-1.5">
                        <FileCounters file={file} />
                        {file.hunkCount > 1 ? (
                          <span className="font-mono text-[10px] text-muted-foreground">{file.hunkCount} hunks</span>
                        ) : null}
                      </span>
                    </span>
                    <span
                      role="checkbox"
                      aria-checked={viewed}
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        props.onViewed(file.path, !viewed);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === " " || e.key === "Enter") {
                          e.preventDefault();
                          e.stopPropagation();
                          props.onViewed(file.path, !viewed);
                        }
                      }}
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                        viewed
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input bg-background",
                      )}
                      aria-label={viewed ? "Mark as not viewed" : "Mark as viewed"}
                    >
                      {viewed ? <CheckIcon className="size-2.5" /> : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </div>
  );
}
