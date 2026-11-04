import { useEffect, useState } from "react";
import {
  ArrowRightIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  RotateCwIcon,
  WrapTextIcon,
} from "lucide-react";
import { shortSha, type ReviewMeta } from "../api.ts";
import { copyText } from "../lib/copy-text.ts";
import { readingStatus, reviewReadingPaths } from "../lib/reading-progress.ts";
import { reviewRef } from "../lib/review-ref.ts";
import { waitCopy } from "../lib/wait.ts";
import { cn } from "@/lib/utils.ts";
import { Button } from "@/components/ui/button.tsx";
import { Segmented, SegmentedItem } from "@/components/ui/segmented.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import type { Selection } from "../lib/selection.ts";
import { GroupNav, NextTitle } from "./GroupNav.tsx";
import { ProgressBar } from "./ReadingMark.tsx";
import { HintWithKey } from "./Kbd.tsx";
import { Logo } from "./Logo.tsx";
import { DisplayMenu, ThemeButton } from "./DisplayMenu.tsx";
import { WaitMark } from "./WaitMark.tsx";

// The header loses words as the window narrows, so its controls never overlap.
const WIDE_ONLY = "max-[1440px]:sr-only";
const NARROW_HIDDEN = "max-[1100px]:sr-only";

export function Header(props: {
  meta: ReviewMeta;
  selection: Selection | null;
  onSelect: (selection: Selection) => void;
  wrap: boolean;
  split: boolean;
  /** The inspector shows one file, so the diff layout does not apply. */
  inspectorOpen: boolean;
  sidebarOpen: boolean;
  onSidebar: () => void;
  onWrap: () => void;
  onUnified: () => void;
  onSplit: () => void;
  onRefresh: () => void;
  viewedPaths: ReadonlySet<string>;
  busy?: boolean;
  comments?: boolean;
  onComments?: () => void;
}) {
  const { meta, split, onUnified, onSplit, onRefresh, busy = false } = props;
  return (
    <header className="relative flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card pr-5 pl-3">
      <div className="flex shrink-0 items-center gap-4 min-[1440px]:min-w-0 min-[1440px]:flex-1">
        <SidebarButton open={props.sidebarOpen} onClick={props.onSidebar} />
        <Logo className="-ml-2" wordClassName={NARROW_HIDDEN} />
        <Separator orientation="vertical" className="h-5" />
        <Range resolved={meta.resolved} />
      </div>
      <GroupNav
        meta={meta}
        selection={props.selection}
        onSelect={props.onSelect}
        position
        className="ml-1 min-[1440px]:ml-0"
      />
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <NextTitle meta={meta} selection={props.selection} />
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <ReviewProgress paths={reviewReadingPaths(meta)} viewed={props.viewedPaths} />
          {!props.inspectorOpen && showsDiffCards(props.selection) ? (
            <>
              <WrapButton wrap={props.wrap} onWrap={props.onWrap} />
              <LayoutControl split={split} onUnified={onUnified} onSplit={onSplit} />
            </>
          ) : null}
          <DisplayMenu
            wrap={props.wrap}
            onWrap={props.onWrap}
            comments={props.comments}
            onComments={props.onComments}
            labelClassName={WIDE_ONLY}
          />
          <ThemeButton />
          {busy ? <WaitMark layout="inline" label={waitCopy.review} /> : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={onRefresh}
                aria-busy={busy}
                className="text-muted-foreground hover:text-foreground [&_svg]:size-3.5"
              >
                <RotateCwIcon />
                <span className={WIDE_ONLY}>Refresh</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <HintWithKey
                text={busy ? waitCopy.review : "Read the review and git again"}
                shortcut="r"
              />
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}

function showsDiffCards(selection: Selection | null): boolean {
  return selection !== null && selection.kind !== "overview" && selection.kind !== "changes";
}

function SidebarButton(props: { open: boolean; onClick: () => void }) {
  const text = props.open ? "Hide the sidebar" : "Show the sidebar";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-sm"
          variant="ghost"
          aria-label={text}
          aria-expanded={props.open}
          aria-keyshortcuts="b"
          onClick={props.onClick}
          className="text-muted-foreground hover:text-foreground [&_svg]:size-4"
        >
          {props.open ? <PanelLeftCloseIcon /> : <PanelLeftOpenIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <HintWithKey text={text} shortcut="b" />
      </TooltipContent>
    </Tooltip>
  );
}

function WrapButton(props: { wrap: boolean; onWrap: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          aria-pressed={props.wrap}
          onClick={props.onWrap}
          className={cn(
            "[&_svg]:size-3.5",
            props.wrap
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <WrapTextIcon />
          Wrap
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <HintWithKey text="Wrap long lines" shortcut="w" />
      </TooltipContent>
    </Tooltip>
  );
}

function LayoutControl(props: { split: boolean; onUnified: () => void; onSplit: () => void }) {
  return (
    <Segmented label="Diff layout">
      <SegmentedItem
        active={!props.split}
        onClick={props.onUnified}
        hint={<HintWithKey text="Show base and head in one column" shortcut="s" />}
      >
        Unified
      </SegmentedItem>
      <SegmentedItem
        active={props.split}
        onClick={props.onSplit}
        hint={<HintWithKey text="Show base and head side by side" shortcut="s" />}
      >
        Split
      </SegmentedItem>
    </Segmented>
  );
}

function ReviewProgress(props: { paths: readonly string[]; viewed: ReadonlySet<string> }) {
  const status = readingStatus(props.paths, props.viewed);
  if (status === null || status.viewed === 0) {
    return null;
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          role="status"
          aria-label={`${status.filesLabel} in this review`}
          className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground tabular-nums"
        >
          <ProgressBar
            value={status.viewed / status.total}
            done={status.left === 0}
            className="w-16 bg-border max-[1100px]:hidden"
          />
          <span aria-hidden className="max-[1440px]:hidden">
            {status.filesLabel}
          </span>
          <span aria-hidden className="min-[1440px]:hidden">
            {status.viewed}/{status.total}
          </span>
        </div>
      </TooltipTrigger>
      <TooltipContent>Files you marked as viewed in this review</TooltipContent>
    </Tooltip>
  );
}

/** Short SHAs on both sides, so the range has one fixed shape. Ref names stay in the tooltip. */
function Range(props: { resolved: ReviewMeta["resolved"] }) {
  const base = rangeRef(props.resolved.baseRef, props.resolved.baseSha);
  const head = rangeRef(props.resolved.headRef, props.resolved.headSha);
  return (
    <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <span className={NARROW_HIDDEN}>base</span>
        <CopyRef {...base} />
      </span>
      <Tooltip>
        <TooltipTrigger asChild>
          <span role="img" aria-label="to" className="shrink-0 cursor-default">
            <ArrowRightIcon aria-hidden className="size-3.5" />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[min(24rem,calc(100vw-2rem))]">
          <span className="block">Changes in head since base</span>
          <span className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-2">
            <span className="text-background/70">Base</span>
            <span className="truncate font-mono">{base.tooltip}</span>
            <span className="text-background/70">Head</span>
            <span className="truncate font-mono">{head.tooltip}</span>
          </span>
        </TooltipContent>
      </Tooltip>
      <span className="flex items-center gap-1">
        <span className={NARROW_HIDDEN}>head</span>
        <CopyRef {...head} />
      </span>
    </div>
  );
}

function rangeRef(ref: string, sha: string) {
  return { ...reviewRef(ref, sha), display: shortSha(sha) };
}

function CopyRef(props: { display: string; copy: string; tooltip: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const id = window.setTimeout(() => setCopied(false), 1600);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="-mx-0.5 cursor-pointer rounded-sm px-0.5 py-0.5 font-mono text-[13px] text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label={`Copy ${props.copy}`}
          aria-live="polite"
          onClick={() => {
            setCopied(true);
            void copyText(props.copy).catch((cause: unknown) => {
              setCopied(false);
              console.error(cause);
            });
          }}
        >
          {copied ? <span className="font-sans text-xs">Copied</span> : props.display}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[min(24rem,calc(100vw-2rem))]">
        <span className="font-mono">{props.tooltip}</span>
        <span className="block text-background/70">Click to copy</span>
      </TooltipContent>
    </Tooltip>
  );
}
