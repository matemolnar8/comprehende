import { addedSymbols, hunkRangeLabel } from "../../schema/hunk-meta.ts";
import { PierreFileDiff } from "../PierreDiff.tsx";
import { fetchPatch } from "../api.ts";
import { ImageDiff } from "./ImageDiff.tsx";
import { WaitMark } from "./WaitMark.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import type { GroupFile } from "../lib/group-files.ts";
import { waitCopy } from "../lib/wait.ts";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useId, useState, type MouseEvent } from "react";

export function HunkView(props: {
  file: GroupFile;
  active: boolean;
  index: number;
  split: boolean;
  splitRatio: number;
  wrap: boolean;
  viewed: boolean;
  onSplitRatio: (ratio: number) => void;
  onOpen: (path: string) => void;
  onViewed: (path: string, viewed: boolean) => void;
}) {
  const { file, active, index, split, splitRatio, wrap, viewed, onSplitRatio, onOpen, onViewed } = props;
  const deferred = file.kind === "lockfile";
  const [collapsed, setCollapsed] = useState(viewed || deferred);
  const [patch, setPatch] = useState(file.patch);
  const [patchError, setPatchError] = useState<string | null>(null);
  const first = file.hunks[0];
  const symbols = addedSymbols(
    file.hunks.flatMap((hunk) => hunk.lines.filter((line) => line.kind === "add").map((line) => line.text)),
  );
  const label = file.oldPath !== undefined ? `${file.oldPath} → ${file.path}` : file.path;
  const bodyId = useId();

  useEffect(() => {
    setCollapsed(viewed || deferred);
  }, [deferred, viewed]);

  useEffect(() => {
    if (collapsed || !deferred || patch !== "" || patchError !== null) {
      return;
    }
    let cancelled = false;
    void fetchPatch(file.path)
      .then((next) => {
        if (!cancelled) {
          setPatch(next.patch);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setPatchError(cause instanceof Error ? cause.message : String(cause));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [collapsed, deferred, file.path, patch, patchError]);

  const toggleCollapsed = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest("button, input, label, a") !== null) {
      return;
    }
    setCollapsed((value) => !value);
  };

  return (
    <article
      className={cn("hunk-card overflow-hidden rounded-lg border bg-card", active ? "border-primary" : "border-border")}
      data-hunk={index}
    >
      <header
        className={cn(
          "sticky top-0 z-10 flex cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 bg-card px-3 py-2",
          collapsed ? null : "border-b border-border",
        )}
        onClick={toggleCollapsed}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="size-6"
          aria-expanded={!collapsed}
          aria-controls={bodyId}
          aria-label={collapsed ? "Expand file" : "Collapse file"}
          onClick={() => setCollapsed((value) => !value)}
        >
          <ChevronDownIcon className={cn("hunk-chevron size-4", collapsed && "-rotate-90")} />
        </Button>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="link"
              className={cn("file-path h-auto p-0 font-mono text-sm", viewed && "text-muted-foreground")}
              onClick={() => onOpen(file.path)}
            >
              {label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open file</TooltipContent>
        </Tooltip>
        <code className="font-mono text-xs text-muted-foreground">
          {file.kind === "image"
            ? "image"
            : file.kind === "lockfile"
              ? "lockfile"
              : file.hunkCount === 1 && first !== undefined
                ? hunkRangeLabel(first.header)
                : `${file.hunkCount} hunks`}
        </code>
        {file.kind === "image" ? (
          <span className="font-mono text-[11px] text-muted-foreground">{file.status}</span>
        ) : (
          <span className="font-mono text-[11px] tabular-nums">
            <span className="text-del">−{file.removed}</span> <span className="text-add">+{file.added}</span>
          </span>
        )}
        {symbols.length > 0
          ? symbols.map((name) => (
              <Badge key={name} variant="outline" className="font-mono font-normal">
                {name}
              </Badge>
            ))
          : null}
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground select-none">
              <input
                type="checkbox"
                className="size-3.5 accent-primary"
                checked={viewed}
                onChange={(event) => onViewed(file.path, event.target.checked)}
              />
              Viewed
            </label>
          </TooltipTrigger>
          <TooltipContent>{viewed ? "Mark as not viewed" : "Mark as viewed"} (v)</TooltipContent>
        </Tooltip>
      </header>
      <div id={bodyId} hidden={collapsed}>
        {collapsed ? null : file.kind === "image" ? (
          <ImageDiff path={file.path} status={file.status} />
        ) : patchError !== null ? (
          <p className="px-3 py-2 text-sm text-warn">{patchError}</p>
        ) : deferred && patch === "" ? (
          <WaitMark label={waitCopy.lockfile} />
        ) : (
          <PierreFileDiff
            patch={patch}
            split={split}
            wrap={wrap}
            splitRatio={splitRatio}
            onSplitRatio={onSplitRatio}
          />
        )}
      </div>
    </article>
  );
}
