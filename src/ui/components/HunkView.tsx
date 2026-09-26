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
import { isPureRelocation, movedMarks, relocationWord } from "../lib/relocation.ts";
import type { FileComment } from "../lib/source-display.ts";
import { waitCopy } from "../lib/wait.ts";
import { ChevronDownIcon } from "lucide-react";
import { useEffect, useId, useMemo, useState, type MouseEvent } from "react";

const motion = "duration-[var(--motion)] ease-[var(--motion-ease)]";

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
  comments?: FileComment[];
  focusCommentId?: string;
}) {
  const { file, active, index, split, splitRatio, wrap, viewed, onSplitRatio, onOpen, onViewed, comments, focusCommentId } =
    props;
  const deferred = file.kind === "lockfile";
  const [collapsed, setCollapsed] = useState(viewed || deferred);
  const [patch, setPatch] = useState(file.patch);
  const [patchError, setPatchError] = useState<string | null>(null);
  const first = file.hunks[0];
  const symbols = addedSymbols(
    file.hunks.flatMap((hunk) => hunk.lines.filter((line) => line.kind === "add").map((line) => line.text)),
  );
  const label = file.oldPath !== undefined ? `${file.oldPath} → ${file.path}` : file.path;
  const word = relocationWord(file);
  const pure = isPureRelocation(file);
  const moves = useMemo(() => movedMarks(file.hunks), [file.hunks]);
  const bodyId = useId();

  const fileComments = useMemo(
    () => (comments ?? []).filter((comment) => comment.path === file.path || comment.path === file.oldPath),
    [comments, file.oldPath, file.path],
  );
  const focused = focusCommentId !== undefined && fileComments.some((comment) => comment.id === focusCommentId);

  useEffect(() => {
    setCollapsed(viewed || deferred);
  }, [deferred, viewed]);

  useEffect(() => {
    if (focused) {
      setCollapsed(false);
    }
  }, [focused]);

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

  const relocationBadge =
    word !== undefined ? (
      <Badge variant="outline" className="font-normal">
        {word}
        {file.relocation?.similarity !== undefined ? (
          <span className="font-mono font-normal tabular-nums text-muted-foreground">{file.relocation.similarity}%</span>
        ) : null}
      </Badge>
    ) : null;
  const symbolBadges = symbols.map((name) => (
    <Badge key={name} variant="outline" className="font-mono font-normal">
      {name}
    </Badge>
  ));
  const hasChips = relocationBadge !== null || symbolBadges.length > 0;

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border bg-card",
        active ? "border-2 border-primary" : "border-border",
      )}
      data-hunk={index}
    >
      <header
        className={cn(
          "sticky top-0 z-10 bg-card px-3 py-2",
          pure ? null : "cursor-pointer",
          collapsed || pure ? null : "border-b border-border",
        )}
        onClick={pure ? undefined : toggleCollapsed}
      >
        <div className="flex min-w-0 items-center gap-3">
          {pure ? null : (
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
              <ChevronDownIcon className={cn("size-4 transition-transform", motion, collapsed && "-rotate-90")} />
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="link"
                className={cn(
                  "h-auto min-w-0 max-w-full shrink justify-start truncate p-0 text-left font-mono text-sm transition-colors",
                  motion,
                  viewed && "text-muted-foreground",
                )}
                onClick={() => onOpen(file.path)}
              >
                {label}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open file</TooltipContent>
          </Tooltip>
          <div className="ml-auto flex shrink-0 items-center gap-3">
            {pure ? null : (
              <code className="font-mono text-xs text-muted-foreground">
                {file.kind === "image"
                  ? "image"
                  : file.kind === "lockfile"
                    ? "lockfile"
                    : file.hunkCount === 1 && first !== undefined
                      ? hunkRangeLabel(first.header)
                      : `${file.hunkCount} hunks`}
              </code>
            )}
            {file.kind === "image" && word === undefined ? (
              <span className="font-mono text-[11px] text-muted-foreground">{file.status}</span>
            ) : file.kind === "image" || pure ? null : (
              <span className="font-mono text-[11px] tabular-nums">
                <span className="text-del">−{file.removed}</span> <span className="text-add">+{file.added}</span>
              </span>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground select-none">
                  <input
                    type="checkbox"
                    className="size-3.5 accent-primary"
                    checked={viewed}
                    onChange={(event) => onViewed(file.path, event.target.checked)}
                  />
                  <span className="max-[799px]:hidden">Viewed</span>
                </label>
              </TooltipTrigger>
              <TooltipContent>{viewed ? "Mark as not viewed" : "Mark as viewed"} (v)</TooltipContent>
            </Tooltip>
          </div>
        </div>
        {hasChips ? (
          <div className={cn("mt-1.5 flex flex-wrap items-center gap-1.5", pure ? null : "pl-9")}>
            {relocationBadge}
            {symbolBadges}
          </div>
        ) : null}
      </header>
      {pure ? null : (
        <div id={bodyId} hidden={collapsed}>
          {collapsed ? null : file.kind === "image" ? (
            <ImageDiff path={file.path} status={file.status} />
          ) : patchError !== null ? (
            <p className="px-3 py-2 text-sm text-warn">{patchError}</p>
          ) : deferred && patch === "" ? (
            <WaitMark label={waitCopy.lockfile} />
          ) : (
            <PierreFileDiff
              path={file.path}
              patch={patch}
              split={split}
              wrap={wrap}
              splitRatio={splitRatio}
              onSplitRatio={onSplitRatio}
              hydrate={file.complete}
              comments={fileComments}
              moves={moves}
              focusCommentId={focusCommentId}
            />
          )}
        </div>
      )}
    </article>
  );
}
