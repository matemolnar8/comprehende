import type { CSSProperties } from "react";
import { type ReviewMeta } from "../api.ts";
import { REVIEW_BUCKETS } from "../../api/types.ts";
import { padIndex, sizeLabel } from "../../schema/types.ts";
import { cn } from "@/lib/utils.ts";
import type { Selection } from "../lib/selection.ts";
import { colorIndexByGroupId, groupOrderIndex, isMixedReview, partColor, type Part } from "../lib/parts.ts";
import { FilePeek } from "./FilePeek.tsx";
import { HashLink, hashLinkText } from "./HashLink.tsx";
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
  const byId = new Map(meta.groups.map((group) => [group.id, group]));
  const documentLookFor = meta.document.lookFor?.length ?? 0;
  const totalLookFor = documentLookFor + meta.groups.reduce((sum, group) => sum + group.lookFor.length, 0);
  return (
    <nav className={cn("h-full overflow-auto bg-card", props.compact === true ? "py-3" : "py-6", props.className)}>
      <div className="relative">
        <span className={styles.selection} aria-hidden />
        <ul className="mb-6 list-none p-0">
          <li>
            <StackItem
              active={selection?.kind === "overview"}
              selection={{ kind: "overview" }}
              onSelect={onSelect}
              title="Overview"
              count={sizeLabel(meta.document.size)}
              lookForCount={totalLookFor}
            />
          </li>
        </ul>
        <ul className="mb-6 list-none p-0">
          {parts.map((part) => {
            const firstId = part.groupIds[0];
            return (
              <li key={part.groupIds.join("\0")} className={mixed ? "mb-3 last:mb-0" : undefined}>
                {mixed && part.title !== undefined && firstId !== undefined ? (
                  <HashLink
                    selection={{ kind: "group", id: firstId }}
                    onSelect={onSelect}
                    className="mx-2 mb-1 flex w-[calc(100%-16px)] items-center gap-2 px-2.5 py-1 text-left font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground min-[800px]:mx-3 min-[800px]:w-[calc(100%-24px)] min-[800px]:px-3"
                    ariaLabel={`Open part ${part.title}`}
                  >
                    <span
                      aria-hidden
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: partColor(part.colorIndex) }}
                    />
                    <span className={hashLinkText}>{part.title}</span>
                  </HashLink>
                ) : null}
                <ul className="m-0 list-none p-0">
                  {part.groupIds.map((id) => {
                    const group = byId.get(id);
                    if (group === undefined) {
                      return null;
                    }
                    return (
                      <li key={group.id}>
                        <StackItem
                          active={selection?.kind === "group" && selection.id === group.id}
                          selection={{ kind: "group", id: group.id }}
                          onSelect={onSelect}
                          index={padIndex(groupOrderIndex(parts, group.id))}
                          title={group.title}
                          files={group.files}
                          count={group.staleCount > 0 ? `${group.staleCount} stale` : undefined}
                          lookForCount={group.lookFor.length}
                          colorIndex={colors.get(group.id)}
                        />
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
          {meta.unassigned.hunkCount > 0 ? (
            <li>
              <StackItem
                active={selection?.kind === REVIEW_BUCKETS.unassigned}
                selection={{ kind: REVIEW_BUCKETS.unassigned }}
                onSelect={onSelect}
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
                selection={{ kind: REVIEW_BUCKETS.lockfiles }}
                onSelect={onSelect}
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
  selection: Selection;
  onSelect: (selection: Selection) => void;
  title: string;
  files?: readonly string[];
  count?: string;
  lookForCount?: number;
  index?: string;
  warn?: boolean;
  muted?: boolean;
  colorIndex?: number;
}) {
  const colorIndex = props.colorIndex;
  const files = props.files ?? [];
  const lookForCount = props.lookForCount ?? 0;
  const showStrand = colorIndex !== undefined || props.active;
  const strand =
    colorIndex !== undefined
      ? partColor(colorIndex)
      : props.muted
        ? "var(--muted-foreground)"
        : undefined;
  const label =
    files.length > 0
      ? `${props.title}, ${files.length} files${props.count !== undefined ? `, ${props.count}` : ""}${lookForCount > 0 ? `, ${lookForCount} look for` : ""}`
      : lookForCount > 0
        ? `${props.title}, ${lookForCount} look for`
        : undefined;
  return (
    <HashLink
      selection={props.selection}
      onSelect={props.onSelect}
      ariaLabel={label}
      ariaCurrent={props.active ? "page" : undefined}
      className={cn(
        "group relative z-1 mx-2 mb-0.5 flex h-auto w-[calc(100%-16px)] min-w-0 items-start justify-start gap-2 rounded-md px-2.5 py-1.5 text-left font-normal whitespace-normal no-underline min-[800px]:mx-3 min-[800px]:mb-1 min-[800px]:w-[calc(100%-24px)] min-[800px]:gap-2.5 min-[800px]:px-3 min-[800px]:py-2",
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
          style={strand !== undefined ? ({ "--strand": strand } as CSSProperties) : undefined}
          aria-hidden
        />
      ) : null}
      {props.index !== undefined ? (
        <span className="mt-px w-5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">{props.index}</span>
      ) : null}
      <span className="min-w-0 flex-1 text-left leading-snug">
        <span className="flex min-w-0 items-start gap-2.5">
          <span className={cn("min-w-0 flex-1", hashLinkText)}>{props.title}</span>
          {props.count !== undefined ? (
            <span className={cn("mt-px shrink-0 text-[11px] tabular-nums text-muted-foreground", props.warn && "text-warn")}>
              {props.count}
            </span>
          ) : null}
        </span>
        <FilePeek paths={files} />
        {lookForCount > 0 ? (
          <span className="mt-1 block font-mono text-[11px] leading-snug text-muted-foreground">
            Look for · {lookForCount}
          </span>
        ) : null}
      </span>
    </HashLink>
  );
}
