import type { CSSProperties } from "react";
import { padLayer, sizeLabel, type ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import type { Selection } from "../lib/selection.ts";
import { colorIndexByLayerId, isMixedReview, partColor, type Part } from "../lib/parts.ts";

export function Sidebar(props: {
  meta: ReviewMeta;
  selection: Selection | null;
  parts: Part[];
  onSelect: (selection: Selection) => void;
}) {
  const { meta, selection, parts, onSelect } = props;
  const mixed = isMixedReview(parts);
  const colors = mixed ? colorIndexByLayerId(parts) : new Map<string, number>();
  return (
    <nav className="h-full overflow-auto py-6">
      <div className="stack">
        <span className="stack-selection" aria-hidden />
        <ul className="mb-6 list-none p-0">
          <li>
            <StackItem
              active={selection?.kind === "overview"}
              onClick={() => onSelect({ kind: "overview" })}
              title="Overview"
              count={sizeLabel(meta.document.size)}
            />
          </li>
        </ul>
        <ul className="mb-6 list-none p-0">
          {meta.groups.map((group, index) => (
            <li key={group.id}>
              <StackItem
                active={selection?.kind === "group" && selection.id === group.id}
                onClick={() => onSelect({ kind: "group", id: group.id })}
                index={padLayer(index + 1)}
                title={group.title}
                count={group.staleCount > 0 ? `${group.staleCount} stale` : undefined}
                colorIndex={colors.get(group.id)}
              />
            </li>
          ))}
          {meta.unassigned.hunkCount > 0 ? (
            <li>
              <StackItem
                active={selection?.kind === "unassigned"}
                onClick={() => onSelect({ kind: "unassigned" })}
                title="Unassigned"
                count={String(meta.unassigned.hunkCount)}
                warn
              />
            </li>
          ) : null}
          {meta.lockfiles.fileCount > 0 ? (
            <li>
              <StackItem
                active={selection?.kind === "lockfiles"}
                onClick={() => onSelect({ kind: "lockfiles" })}
                title="Lockfiles"
                count={String(meta.lockfiles.fileCount)}
              />
            </li>
          ) : null}
        </ul>
      </div>
      {meta.document.tickets !== undefined && meta.document.tickets.length > 0 ? (
        <ul className="space-y-2 px-4 text-sm text-muted-foreground">
          {meta.document.tickets.map((ticket) => (
            <li key={ticket.id}>
              {ticket.url !== undefined ? (
                <a className="text-primary hover:underline" href={ticket.url} target="_blank" rel="noreferrer">
                  {ticket.id}
                  {ticket.title !== undefined ? ` ${ticket.title}` : ""}
                </a>
              ) : (
                <span>
                  {ticket.id}
                  {ticket.title !== undefined ? ` ${ticket.title}` : ""}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
}

function StackItem(props: {
  active: boolean;
  onClick: () => void;
  title: string;
  count?: string;
  index?: string;
  warn?: boolean;
  colorIndex?: number;
}) {
  const colorIndex = props.colorIndex;
  const showStrand = colorIndex !== undefined || props.active;
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={props.onClick}
      style={colorIndex !== undefined ? ({ "--strand": partColor(colorIndex) } as CSSProperties) : undefined}
      className={cn(
        "stack-item relative z-1 mx-3 mb-1 h-auto w-[calc(100%-24px)] min-w-0 items-start justify-start gap-2.5 rounded-md px-3 py-2 text-left font-normal whitespace-normal hover:bg-transparent",
        props.active && "stack-item-active text-foreground",
        props.warn && "text-warn hover:text-warn",
      )}
    >
      {showStrand ? (
        <span className={cn("stack-strand", colorIndex !== undefined && !props.active && "opacity-45")} aria-hidden />
      ) : null}
      {props.index !== undefined ? (
        <span className="mt-px w-5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">{props.index}</span>
      ) : null}
      <span className="min-w-0 flex-1 text-left leading-snug">{props.title}</span>
      {props.count !== undefined ? (
        <span className={cn("shrink-0 text-[11px] tabular-nums text-muted-foreground", props.warn && "text-warn")}>
          {props.count}
        </span>
      ) : null}
    </Button>
  );
}
