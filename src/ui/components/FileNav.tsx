import { useEffect, useRef, useState } from "react";
import { CheckIcon, ChevronRightIcon, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { fileBasename, fileDirname, readStoredRailCollapsed, writeStoredRailCollapsed } from "../lib/file-nav.ts";
import { fileIndexAtHunk } from "../lib/group-files.ts";
import type { GroupFile } from "../lib/group-files.ts";

function FileCounters(props: { file: GroupFile }) {
  const { file } = props;
  if (file.kind === "image") return <span className="font-mono text-[11px] text-muted-foreground">{file.status}</span>;
  return (
    <span className="font-mono text-[11px] tabular-nums">
      <span className="text-del">−{file.removed}</span> <span className="text-add">+{file.added}</span>
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
  const railRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("rail");
      if (q === "collapsed") return true;
      if (q === "open") return false;
    } catch {}
    try { return readStoredRailCollapsed(); } catch { return false; }
  });

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    try { writeStoredRailCollapsed(next); } catch {}
    try {
      const url = new URL(window.location.href);
      if (next) url.searchParams.set("rail", "collapsed");
      else url.searchParams.delete("rail");
      window.history.replaceState(null, "", url);
    } catch {}
  };

  useEffect(() => {
    const el = railRef.current?.querySelector(`[data-rail="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [activeIndex]);

  if (collapsed) {
    return (
      <div className="mt-4 flex min-h-0 gap-0 max-sm:flex-col">
        <div className="min-w-0 flex-1 space-y-8">{props.children}</div>
        <div className="sticky top-4 flex h-[calc(100vh-8rem)] shrink-0 self-start flex-col items-center gap-3 border-l border-border bg-card py-3" style={{ width: "44px" }}>
          <Button size="icon-sm" variant="ghost" className="size-7" aria-label="Expand file list" onClick={toggle}>
            <ChevronRightIcon className="size-4 rotate-180" />
          </Button>
          <div className="font-mono text-[10px] leading-none text-muted-foreground [writing-mode:vertical-lr]">{files.length} files</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 flex min-h-0 gap-6 max-sm:flex-col">
      <div className="min-w-0 flex-1 space-y-8">{props.children}</div>
      <nav
        ref={railRef}
        aria-label="Files in group"
        className="flex h-[calc(100vh-7rem)] w-[300px] shrink-0 flex-col overflow-hidden rounded-lg border border-border bg-card shadow-card sticky top-4 self-start max-lg:w-[240px] max-sm:w-full max-sm:h-auto max-sm:max-h-[40vh]"
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <p className="flex-1 font-mono text-[11px] tabular-nums text-muted-foreground">
            {files.filter((f) => viewedPaths.has(f.path)).length} of {files.length} viewed
          </p>
          <Button size="icon-sm" variant="ghost" className="size-7 shrink-0" aria-label="Collapse file list" onClick={toggle}>
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <ul className="space-y-0.5 px-2">
            {files.map((file, i) => {
              const viewed = viewedPaths.has(file.path);
              const active = i === activeIndex;
              return (
                <li key={file.path}>
                  <button
                    data-rail={i}
                    onClick={() => props.onSelect(file.firstIndex)}
                    className={cn(
                      "flex w-full items-start gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
                      active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    <FileIcon className="mt-0.5 size-3.5 shrink-0" />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate font-mono text-xs leading-tight", viewed && "opacity-60")}>
                        {fileBasename(file.path)}
                      </span>
                      {fileDirname(file.path) ? (
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
