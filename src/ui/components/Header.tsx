import { useEffect, useState, type ReactNode } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import type { ReviewMeta } from "../api.ts";
import { copyText } from "../lib/copy-text.ts";
import { reviewReadingPaths } from "../lib/reading-progress.ts";
import { reviewRef } from "../lib/review-ref.ts";
import { waitCopy } from "../lib/wait.ts";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { useTheme } from "@/lib/ThemeProvider.tsx";
import type { Selection } from "../lib/selection.ts";
import { GroupNav } from "./GroupNav.tsx";
import { ReadingMark } from "./ReadingMark.tsx";
import { Kbd } from "./Kbd.tsx";
import { Logo } from "./Logo.tsx";
import { WaitMark } from "./WaitMark.tsx";

export function Header(props: {
  meta: ReviewMeta;
  selection: Selection | null;
  onSelect: (selection: Selection) => void;
  wrap: boolean;
  split: boolean;
  onWrap: () => void;
  onUnified: () => void;
  onSplit: () => void;
  onRefresh: () => void;
  viewedPaths: ReadonlySet<string>;
  busy?: boolean;
  comments?: boolean;
  onComments?: () => void;
}) {
  const { meta, wrap, split, onWrap, onUnified, onSplit, onRefresh, busy = false, comments, onComments } = props;
  return (
    <header className="flex flex-col gap-2 border-b border-border bg-card px-5 py-3 min-[800px]:flex-row min-[800px]:flex-wrap min-[800px]:items-center min-[800px]:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <Logo />
        <Range resolved={meta.resolved} />
        <ReadingMark paths={reviewReadingPaths(meta)} viewed={props.viewedPaths} noun className="mt-0" />
        {meta.groups.length > 0 ? (
          <div className="flex items-center gap-1">
            <GroupNav meta={meta} selection={props.selection} onSelect={props.onSelect} />
            <span className="flex gap-0.5">
              <Kbd>[</Kbd>
              <Kbd>]</Kbd>
            </span>
          </div>
        ) : null}
      </div>
      <div className="ml-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={wrap ? "secondary" : "outline"}
              aria-pressed={wrap}
              aria-label="Wrap lines"
              onClick={onWrap}
            >
              Wrap
              <Kbd className="max-sm:hidden">w</Kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Wrap long lines</TooltipContent>
        </Tooltip>
        {onComments !== undefined ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant={comments === true ? "secondary" : "outline"}
                aria-pressed={comments === true}
                aria-label="Show comments"
                onClick={onComments}
              >
                Comments
                <Kbd className="max-sm:hidden">c</Kbd>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Show comments on the diffs</TooltipContent>
          </Tooltip>
        ) : null}
        <div className="flex items-center gap-1.5">
          <div className="flex overflow-hidden rounded-md border border-input">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant={split ? "ghost" : "secondary"}
                  className="rounded-none border-0"
                  onClick={onUnified}
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
                  onClick={onSplit}
                  aria-pressed={split}
                >
                  Split
                </Button>
              </TooltipTrigger>
              <TooltipContent>Side-by-side diff</TooltipContent>
            </Tooltip>
          </div>
          <Kbd className="max-sm:hidden">s</Kbd>
        </div>
        <ThemeToggle />
        {busy ? <WaitMark layout="inline" label={waitCopy.review} /> : null}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={onRefresh} aria-busy={busy}>
              Refresh
              <Kbd className="max-sm:hidden">r</Kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{busy ? waitCopy.review : "Reload review"}</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}

function Range(props: { resolved: ReviewMeta["resolved"] }) {
  const base = reviewRef(props.resolved.baseRef, props.resolved.baseSha);
  const head = reviewRef(props.resolved.headRef, props.resolved.headSha);
  return (
    <div className="flex min-w-0 items-baseline gap-1.5 text-sm">
      <CopyRef {...base} />
      <span className="shrink-0 text-muted-foreground">...</span>
      <CopyRef {...head} />
    </div>
  );
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
          className="max-w-[10rem] cursor-pointer truncate rounded-sm px-0.5 font-mono text-primary hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
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
          {copied ? "Copied" : props.display}
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-[min(24rem,calc(100vw-2rem))] font-mono">{props.tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function ThemeToggle(props: { system?: ReactNode }) {
  const { preference, toggleTheme } = useTheme();
  const next = preference === "auto" ? "light" : preference === "light" ? "dark" : "auto";
  const label = next === "auto" ? "Use auto theme" : `Use ${next} theme`;
  const tooltip = next === "auto" ? "Follow system" : `Use ${next} theme`;
  const system = props.system ?? <MonitorIcon />;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-sm"
          variant="outline"
          aria-label={label}
          onClick={toggleTheme}
        >
          {preference === "light" ? <SunIcon /> : preference === "dark" ? <MoonIcon /> : system}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

