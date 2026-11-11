import { PierreFileDiff } from "../PierreDiff.tsx";
import { fetchPatch } from "../api.ts";
import { basename, type FocusRange } from "../../schema/types.ts";
import { DiffStat } from "./DiffStat.tsx";
import { FocusBar, HiddenLines, HunkGap } from "./FocusBar.tsx";
import { ImageDiff, ImageModeControl } from "./ImageDiff.tsx";
import { InlineMd } from "./InlineMd.tsx";
import { HintWithKey } from "./Kbd.tsx";
import { MarkdownDiff, useMarkdownRows } from "./MarkdownDiff.tsx";
import { ViewedToggle } from "./ViewedToggle.tsx";
import { WaitMark } from "./WaitMark.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Segmented, SegmentedItem } from "@/components/ui/segmented.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import { fileFocus, focusBlocks, onFile, toggleHunk, type LetteredNote } from "../lib/focus.ts";
import { gutterDigits, hunkGaps } from "../lib/hunk-gaps.ts";
import { IMAGE_STATUS, IMAGE_TONE_CLASS, type GroupFile } from "../lib/group-files.ts";
import { isMarkdownPath } from "../lib/markdown-diff.ts";
import { setMarkdownView, useMarkdownView } from "../lib/markdown-view.ts";
import { isPureRelocation, movedMarks, relocationWord } from "../lib/relocation.ts";
import type { FileComment } from "../lib/source-display.ts";
import { waitCopy } from "../lib/wait.ts";
import { ChevronDownIcon, Maximize2Icon } from "lucide-react";
import { Fragment, useEffect, useId, useMemo, useState, type MouseEvent } from "react";

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
  focus?: readonly FocusRange[];
  notes?: readonly LetteredNote[];
  fileNote?: string;
}) {
  const {
    file,
    active,
    index,
    split,
    splitRatio,
    wrap,
    viewed,
    onSplitRatio,
    onOpen,
    onViewed,
    comments,
    focusCommentId,
    focus,
    notes,
    fileNote,
  } = props;
  const deferred = file.kind === "lockfile";
  const [collapsed, setCollapsed] = useState(viewed || deferred);
  const [patch, setPatch] = useState(file.patch);
  const [patchError, setPatchError] = useState<string | null>(null);
  const [imageCardWidth, setImageCardWidth] = useState<number>();
  const label = file.oldPath !== undefined ? `${file.oldPath} → ${file.path}` : file.path;
  const name = basename(file.path);
  const labelDir = label.slice(0, label.length - name.length);
  const word = relocationWord(file);
  const pure = isPureRelocation(file);
  const moves = useMemo(() => movedMarks(file.hunks), [file.hunks]);
  const bodyId = useId();

  const fileComments = useMemo(
    () =>
      (comments ?? []).filter(
        (comment) => comment.path === file.path || comment.path === file.oldPath,
      ),
    [comments, file.oldPath, file.path],
  );
  const focused =
    focusCommentId !== undefined && fileComments.some((comment) => comment.id === focusCommentId);

  const lineNotes = useMemo(
    () => (notes ?? []).filter((note) => onFile(note, file)),
    [file, notes],
  );
  const hunkFocus = useMemo(
    () =>
      file.kind === "text"
        ? fileFocus(
            file.hunks,
            (focus ?? []).filter((range) => onFile(range, file)),
          )
        : [],
    [file, focus],
  );
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set());
  const blocks = useMemo(
    () => focusBlocks(patch, file.hunks, hunkFocus, open, lineNotes),
    [file.hunks, hunkFocus, lineNotes, open, patch],
  );
  const gaps = useMemo(() => hunkGaps(blocks ?? [], file.hunks), [blocks, file.hunks]);
  const digits = useMemo(() => gutterDigits(file.hunks), [file.hunks]);
  const markdown = file.kind === "text" && !pure && isMarkdownPath(file.path);
  const markdownView = useMarkdownView();
  // Null when a side cannot be read: the source diff still shows the change.
  const markdownRows = useMarkdownRows(file, markdown && markdownView === "rendered" && !collapsed);
  const rendered = markdown && markdownView === "rendered" && markdownRows !== null;

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
    if (
      event.target instanceof Element &&
      event.target.closest("button, input, label, a") !== null
    ) {
      return;
    }
    setCollapsed((value) => !value);
  };

  const relocationBadge =
    word !== undefined ? (
      <Badge variant="outline" className="shrink-0 font-medium">
        {word}
        {file.relocation?.similarity !== undefined ? (
          <span className="font-normal tabular-nums text-muted-foreground">
            {file.relocation.similarity}%
          </span>
        ) : null}
      </Badge>
    ) : null;

  const compare =
    file.kind === "image" && !collapsed && file.status !== "added" && file.status !== "deleted";

  const imageStatus = file.kind === "image" ? IMAGE_STATUS[file.status] : undefined;
  const meta =
    imageStatus !== undefined
      ? imageStatus.label
      : file.kind === "lockfile"
        ? "Lockfile"
        : pure
          ? null
          : file.hunkCount === 1
            ? "1 hunk"
            : `${file.hunkCount} hunks`;

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border bg-card transition-[border-color]",
        motion,
        active ? "border-primary/50" : "border-border",
      )}
      data-hunk={index}
      style={
        imageCardWidth !== undefined ? { maxWidth: `max(${imageCardWidth}px, 24rem)` } : undefined
      }
    >
      <header
        className={cn(
          "sticky top-0 z-10 bg-card px-3 py-2",
          file.kind === "image" && "@container/card",
          pure ? null : "cursor-pointer",
          collapsed || pure ? null : "border-b border-border",
        )}
        onClick={pure ? undefined : toggleCollapsed}
      >
        <div className="flex min-h-7 min-w-0 flex-wrap items-center gap-x-2 gap-y-1 min-[800px]:flex-nowrap @max-[36rem]/card:flex-wrap">
          {pure ? null : (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6 text-muted-foreground"
              aria-expanded={!collapsed}
              aria-controls={bodyId}
              aria-label={collapsed ? "Expand file" : "Collapse file"}
              onClick={() => setCollapsed((value) => !value)}
            >
              <ChevronDownIcon
                className={cn("size-4 transition-transform", motion, collapsed && "-rotate-90")}
              />
            </Button>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="link"
                className={cn(
                  "h-auto min-w-0 max-w-full shrink justify-start p-0 text-left font-mono text-xs text-foreground underline-offset-[3px] transition-colors hover:text-primary hover:underline focus-visible:text-primary min-[800px]:text-[13px] @max-[36rem]/card:flex-1",
                  motion,
                  viewed && "text-muted-foreground",
                )}
                onClick={() => onOpen(file.path)}
              >
                <span className="flex min-w-0">
                  {labelDir === "" ? null : (
                    // Cut from the start: the last folder tells same-named files apart.
                    <span dir="rtl" className="min-w-[2ch] truncate">
                      <bdi>{labelDir.replace(/\/$/, "")}</bdi>
                    </span>
                  )}
                  <span className="min-w-0 shrink-0 truncate">
                    {labelDir.endsWith("/") ? "/" : null}
                    {name}
                  </span>
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Open the full file</TooltipContent>
          </Tooltip>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-my-1.5 -mr-2 ml-auto h-10 min-w-10 shrink-0 font-normal text-muted-foreground min-[800px]:hidden"
            aria-label="Open file"
            onClick={() => onOpen(file.path)}
          >
            <Maximize2Icon className="size-4" />
            Open
          </Button>
          <div
            className={cn(
              "flex basis-full items-center gap-x-2 min-[800px]:contents @max-[36rem]/card:flex",
              pure ? null : "pl-8",
            )}
          >
            {file.kind === "text" && !pure ? (
              <DiffStat removed={file.removed} added={file.added} />
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="hidden h-6 shrink-0 px-1.5 font-normal text-muted-foreground hover:text-foreground min-[800px]:inline-flex @max-[36rem]/card:-ml-1.5"
              onClick={() => onOpen(file.path)}
            >
              <Maximize2Icon className="size-3.5" />
              Open file
            </Button>
            <div className="contents min-[800px]:ml-auto min-[800px]:flex min-[800px]:shrink-0 min-[800px]:items-center min-[800px]:gap-4">
              {markdown ? <MarkdownViewControl /> : null}
              {meta !== null ? (
                <span
                  className={cn(
                    "text-xs whitespace-nowrap tabular-nums",
                    IMAGE_TONE_CLASS[imageStatus?.tone ?? "muted"],
                  )}
                >
                  {meta}
                </span>
              ) : null}
              <span className="ml-auto flex min-[800px]:ml-0">
                <ViewedToggle viewed={viewed} onChange={(next) => onViewed(file.path, next)} />
              </span>
            </div>
          </div>
        </div>
        {relocationBadge !== null || fileNote !== undefined || compare ? (
          <div className={cn("mt-1 flex flex-wrap items-center gap-2", pure ? null : "pl-8")}>
            {relocationBadge}
            {fileNote !== undefined ? (
              <p className="min-w-0 text-[13px] leading-snug text-foreground/85">
                <InlineMd text={fileNote} />
              </p>
            ) : null}
            {compare ? (
              <div className="ml-auto">
                <ImageModeControl />
              </div>
            ) : null}
          </div>
        ) : null}
      </header>
      {pure ? null : (
        <div id={bodyId} hidden={collapsed}>
          {collapsed ? null : file.kind === "image" ? (
            <ImageDiff path={file.path} status={file.status} onCardWidth={setImageCardWidth} />
          ) : patchError !== null ? (
            <p className="px-3 py-2 text-sm text-warn">{patchError}</p>
          ) : deferred && patch === "" ? (
            <WaitMark label={waitCopy.lockfile} />
          ) : rendered && markdownRows === undefined ? (
            <WaitMark label={waitCopy.file} />
          ) : (
            (blocks ?? [{ kind: "diff", key: "file", patch } as const]).map((block) => {
              const gap = gaps.get(block.key);
              return (
                <Fragment key={block.key}>
                  {gap !== undefined ? <HunkGap lines={gap} /> : null}
                  {block.kind === "bar" ? (
                    <FocusBar
                      focus={block.focus}
                      whole={block.whole}
                      onToggle={() => setOpen((current) => toggleHunk(current, block))}
                    />
                  ) : block.kind === "hidden" ? (
                    <HiddenLines
                      count={block.count}
                      notes={block.notes}
                      onShow={() => setOpen((current) => new Set([...current, block.key]))}
                    />
                  ) : rendered && markdownRows !== undefined ? (
                    <MarkdownDiff
                      path={file.path}
                      rows={markdownRows}
                      patch={block.patch}
                      added={file.status === "added"}
                      split={split}
                      wrap={wrap}
                      splitRatio={splitRatio}
                      onSplitRatio={onSplitRatio}
                      comments={fileComments}
                      moves={moves}
                      notes={lineNotes}
                      focusCommentId={focusCommentId}
                    />
                  ) : (
                    <PierreFileDiff
                      path={file.path}
                      patch={block.patch}
                      added={file.status === "added"}
                      split={split}
                      wrap={wrap}
                      splitRatio={splitRatio}
                      onSplitRatio={onSplitRatio}
                      hydrate={blocks === undefined && file.complete}
                      excerpt={blocks !== undefined}
                      gutterDigits={blocks === undefined ? undefined : digits}
                      comments={fileComments}
                      moves={moves}
                      notes={lineNotes}
                      focusCommentId={focusCommentId}
                    />
                  )}
                </Fragment>
              );
            })
          )}
        </div>
      )}
    </article>
  );
}

/** One choice for every Markdown file. Each copy shows and sets the same shared view. */
function MarkdownViewControl() {
  const view = useMarkdownView();
  return (
    <Segmented label="Markdown view" size="sm">
      <SegmentedItem
        active={view === "rendered"}
        onClick={() => setMarkdownView("rendered")}
        hint={<HintWithKey text="Read the change as rendered Markdown" shortcut="m" />}
      >
        Rendered
      </SegmentedItem>
      <SegmentedItem
        active={view === "source"}
        onClick={() => setMarkdownView("source")}
        hint={<HintWithKey text="Read the change as source lines" shortcut="m" />}
      >
        Source
      </SegmentedItem>
    </Segmented>
  );
}
