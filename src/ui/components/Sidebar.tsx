import type { CSSProperties } from "react";
import { type ReviewMeta } from "../api.ts";
import { REVIEW_BUCKETS } from "../../api/types.ts";
import { padIndex, sizeLabel } from "../../schema/types.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import type { Selection } from "../lib/selection.ts";
import { colorIndexByGroupId, isMixedReview, partColor, type Part } from "../lib/parts.ts";
import { FilePeek } from "./FilePeek.tsx";
import styles from "./Sidebar.module.css";

export function Sidebar(props: {
  meta: ReviewMeta;
  selection: Selection | null;
  parts: Part[];
  onSelect: (selection: Selection) => void;
  compact?: boolean;
  className?: string;
}) {
  const { meta, selection, parts, onSelect } = props;
  const mixed = isMixedReview(parts);
  const colors = mixed ? colorIndexByGroupId(parts) : new Map<string, number>();
  return (
    <nav className={cn("h-full overflow-auto bg-card", props.compact === true ? "py-3" : "py-6", props.className)}>
      <div className="relative">
        <span className={styles.selection} aria-hidden />
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
                index={padIndex(index + 1)}
                title={group.title}
                files={group.files}
                count={group.staleCount > 0 ? `${group.staleCount} stale` : undefined}
                colorIndex={colors.get(group.id)}
              />
            </li>
          ))}
          {meta.unassigned.hunkCount > 0 ? (
            <li>
              <StackItem
                active={selection?.kind === REVIEW_BUCKETS.unassigned}
                onClick={() => onSelect({ kind: REVIEW_BUCKETS.unassigned })}
                title="Unassigned"
                files={meta.unassigned.files}
                count={String(meta.unassigned.hunkCount)}
                warn
              />
            </li>
          ) : null}
          {meta.lockfiles.fileCount > 0 ? (
            <li>
              <StackItem
                active={selection?.kind === REVIEW_BUCKETS.lockfiles}
                onClick={() => onSelect({ kind: REVIEW_BUCKETS.lockfiles })}
                title="Lockfiles"
                files={meta.lockfiles.files}
                count={String(meta.lockfiles.fileCount)}
                muted
              />
            </li>
          ) : null}
        </ul>
      </div>
    </nav>
  );
}

function StackItem(props: {
  active: boolean;
  onClick: () => void;
  title: string;
  files?: readonly string[];
  count?: string;
  index?: string;
  warn?: boolean;
  muted?: boolean;
  colorIndex?: number;
}) {
  const colorIndex = props.colorIndex;
  const files = props.files ?? [];
  const showStrand = colorIndex !== undefined || props.active;
  const strand =
    colorIndex !== undefined
      ? partColor(colorIndex)
      : props.muted
        ? "var(--muted-foreground)"
        : undefined;
  const label =
    files.length > 0
      ? `${props.title}, ${files.length} files${props.count !== undefined ? `, ${props.count}` : ""}`
      : undefined;
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={props.onClick}
      aria-label={label}
      style={strand !== undefined ? ({ "--strand": strand } as CSSProperties) : undefined}
      className={cn(
        "relative z-1 mx-2 mb-0.5 h-auto w-[calc(100%-16px)] min-w-0 items-start justify-start gap-2 rounded-md px-2.5 py-1.5 text-left font-normal whitespace-normal hover:bg-transparent min-[800px]:mx-3 min-[800px]:mb-1 min-[800px]:w-[calc(100%-24px)] min-[800px]:gap-2.5 min-[800px]:px-3 min-[800px]:py-2",
        !props.active && "hover:bg-accent",
        props.active && cn(styles.itemActive, "text-foreground"),
        props.warn && "text-warn hover:text-warn",
      )}
    >
      {showStrand ? (
        <span
          className={cn(
            "pointer-events-none absolute inset-y-1.5 left-0 z-1 w-0.5 rounded-full bg-[var(--strand,var(--primary))] transition-opacity duration-[var(--motion)] ease-[var(--motion-ease)]",
            colorIndex !== undefined && !props.active && "opacity-45",
          )}
          aria-hidden
        />
      ) : null}
      {props.index !== undefined ? (
        <span className="mt-px w-5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">{props.index}</span>
      ) : null}
      <span className="min-w-0 flex-1 text-left leading-snug">
        <span className="flex min-w-0 items-start gap-2.5">
          <span className="min-w-0 flex-1">{props.title}</span>
          {props.count !== undefined ? (
            <span className={cn("mt-px shrink-0 text-[11px] tabular-nums text-muted-foreground", props.warn && "text-warn")}>
              {props.count}
            </span>
          ) : null}
        </span>
        <FilePeek paths={files} />
      </span>
    </Button>
  );
}
