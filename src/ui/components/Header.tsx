import { useEffect, useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";
import type { ReviewMeta } from "../api.ts";
import { reviewRef } from "../lib/review-ref.ts";
import { waitCopy } from "../lib/wait.ts";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { useTheme } from "@/lib/ThemeProvider.tsx";
import { cn } from "@/lib/utils.ts";
import { Kbd } from "./Kbd.tsx";
import { WaitMark } from "./WaitMark.tsx";

export function Header(props: {
  meta: ReviewMeta;
  wrap: boolean;
  split: boolean;
  onWrap: () => void;
  onUnified: () => void;
  onSplit: () => void;
  onRefresh: () => void;
  busy?: boolean;
}) {
  const { meta, wrap, split, onWrap, onUnified, onSplit, onRefresh, busy = false } = props;
  return (
    <header className="flex flex-col gap-2 border-b border-border px-5 py-3 min-[800px]:flex-row min-[800px]:flex-wrap min-[800px]:items-center min-[800px]:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <span className="shrink-0 font-serif text-lg leading-none text-foreground">Comprehende</span>
        <Range resolved={meta.resolved} />
        <Coverage meta={meta} />
      </div>
      <div className="flex flex-wrap items-center gap-2 min-[800px]:justify-end">
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
            void navigator.clipboard.writeText(props.copy).catch(() => {
              setCopied(false);
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

function ThemeToggle() {
  const { resolved, toggleTheme } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon-sm"
          variant="outline"
          aria-label={`Use ${next} theme`}
          onClick={toggleTheme}
        >
          {resolved === "dark" ? <SunIcon /> : <MoonIcon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>Use {next} theme</TooltipContent>
    </Tooltip>
  );
}

function Coverage(props: { meta: ReviewMeta }) {
  const { meta } = props;
  const incomplete = meta.coverage.unassignedCount > 0 || meta.coverage.staleCount > 0;
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
        <span className={cn("shrink-0 font-mono text-xs tabular-nums", incomplete ? "text-warn" : "text-muted-foreground")}>
          {meta.coverage.assignedHunks}/{meta.coverage.totalHunks}
        </span>
      </TooltipTrigger>
      <TooltipContent>{detail}</TooltipContent>
    </Tooltip>
  );
}
