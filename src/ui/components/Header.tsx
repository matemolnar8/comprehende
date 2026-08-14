import { shortSha, type ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";
import { cn } from "@/lib/utils.ts";
import { Kbd } from "./Kbd.tsx";

export function Header(props: {
  meta: ReviewMeta;
  wrap: boolean;
  split: boolean;
  onWrap: () => void;
  onUnified: () => void;
  onSplit: () => void;
  onRefresh: () => void;
}) {
  const { meta, wrap, split, onWrap, onUnified, onSplit, onRefresh } = props;
  return (
    <header className="flex items-center gap-6 border-b border-border px-5 py-3">
      <span className="font-serif text-lg leading-none text-foreground">Comprehende</span>
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
      <Coverage meta={meta} />
      <div className="flex items-center gap-2">
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
              <Kbd>w</Kbd>
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
          <Kbd>s</Kbd>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" onClick={onRefresh}>
              Refresh
              <Kbd>r</Kbd>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Reload live git</TooltipContent>
        </Tooltip>
      </div>
    </header>
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
        <span className={cn("font-mono text-xs tabular-nums", incomplete ? "text-warn" : "text-muted-foreground")}>
          {meta.coverage.assignedHunks}/{meta.coverage.totalHunks}
        </span>
      </TooltipTrigger>
      <TooltipContent>{detail}</TooltipContent>
    </Tooltip>
  );
}
