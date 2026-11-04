import { useRef, type CSSProperties } from "react";
import { type ReviewMeta } from "../api.ts";
import { REVIEW_BUCKETS } from "../../api/types.ts";
import { padIndex, type AttentionKind } from "../../schema/types.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";
import type { Selection } from "../lib/selection.ts";
import {
  colorIndexByGroupId,
  groupOrderIndex,
  isMixedReview,
  partColor,
  type Part,
} from "../lib/parts.ts";
import { readingStatus, type ReadingStatus } from "../lib/reading-progress.ts";
import { useScrollEdges } from "../lib/scroll-edges.ts";
import { ATTENTION_TITLES, AttentionMark } from "./Attention.tsx";
import { FilePeek } from "./FilePeek.tsx";
import { HashLink } from "./HashLink.tsx";
import { scrollFade, scrollFadeBottom } from "./Kicker.tsx";
import { ReadingMark } from "./ReadingMark.tsx";
import styles from "./Sidebar.module.css";

type ChangeMark = "New" | "Updated";

export function Sidebar(props: {
  meta: ReviewMeta;
  selection: Selection | null;
  parts: Part[];
  viewedPaths: ReadonlySet<string>;
  onSelect: (selection: Selection) => void;
  compact?: boolean;
  className?: string;
}) {
  const { meta, selection, parts, viewedPaths, onSelect } = props;
  const mixed = isMixedReview(parts);
  const colors = mixed ? colorIndexByGroupId(parts) : new Map<string, number>();
  const byId = new Map(meta.groups.map((group) => [group.id, group]));
  const changeMarks = new Map(
    (meta.changes?.groups ?? []).flatMap((group): [string, ChangeMark][] =>
      group.state === "removed" ? [] : [[group.id, group.state === "added" ? "New" : "Updated"]],
    ),
  );
  const lookForCount = meta.document.lookFor?.length ?? 0;
  const overviewNote = [
    `${meta.groups.length} ${meta.groups.length === 1 ? "group" : "groups"}`,
    lookForCount > 0 ? `${lookForCount} ${lookForCount === 1 ? "thing" : "things"} to check` : null,
  ]
    .filter((part) => part !== null)
    .join(" · ");
  const changedGroups = meta.changes?.groups.length ?? 0;
  const bucketActive =
    selection?.kind === REVIEW_BUCKETS.unassigned || selection?.kind === REVIEW_BUCKETS.lockfiles;
  const hasBuckets = meta.unassigned.hunkCount > 0 || meta.lockfiles.fileCount > 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  useScrollEdges(scrollRef);
  return (
    <nav className={cn("flex h-full min-h-0 flex-col bg-card", props.className)}>
      <div
        ref={scrollRef}
        className={cn(
          "relative min-h-0 flex-1 overflow-auto",
          mixed ? scrollFadeBottom : scrollFade,
          props.compact === true ? "pb-8" : "pb-10",
        )}
      >
        {bucketActive ? null : <span className={styles.selection} aria-hidden />}
        <ul className={cn("mb-5 list-none p-0", props.compact === true ? "pt-3" : "pt-5")}>
          <li>
            <StackItem
              active={selection?.kind === "overview"}
              selection={{ kind: "overview" }}
              onSelect={onSelect}
              title="Overview"
              note={overviewNote}
              viewedPaths={viewedPaths}
            />
          </li>
          {meta.changes !== undefined ? (
            <li>
              <StackItem
                active={selection?.kind === "changes"}
                selection={{ kind: "changes" }}
                onSelect={onSelect}
                title="What changed"
                note={
                  changedGroups > 0
                    ? `${changedGroups} ${changedGroups === 1 ? "group" : "groups"} changed`
                    : "Since the last review"
                }
                viewedPaths={viewedPaths}
              />
            </li>
          ) : null}
        </ul>
        <ul className="m-0 list-none p-0">
          {parts.map((part) => {
            const firstId = part.groupIds[0];
            return (
              <li
                key={part.groupIds.join("\0")}
                // A group without a part has no heading, so it sits close to the part above.
                className={cn(
                  mixed && "mb-4 last:mb-0",
                  mixed && part.title === undefined && "-mt-3",
                )}
              >
                {mixed && part.title !== undefined && firstId !== undefined ? (
                  <HashLink
                    selection={{ kind: "group", id: firstId }}
                    onSelect={onSelect}
                    className="sticky top-0 z-10 mb-1 flex w-full items-center gap-2 bg-card px-[18px] py-1 text-left text-xs leading-[1.45] font-semibold text-muted-foreground hover:text-foreground min-[800px]:px-6"
                    ariaLabel={`Open part ${part.title}`}
                  >
                    <span
                      aria-hidden
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: partColor(part.colorIndex) }}
                    />
                    <span className="min-w-0 truncate">{part.title}</span>
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
                          stale={group.staleCount}
                          attention={group.attention?.kind}
                          change={changeMarks.get(group.id)}
                          colorIndex={colors.get(group.id)}
                          viewedPaths={viewedPaths}
                        />
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
      {hasBuckets ? (
        <ul className="m-0 shrink-0 list-none border-t border-border p-0 py-2">
          {meta.unassigned.hunkCount > 0 ? (
            <li>
              <StackItem
                active={selection?.kind === REVIEW_BUCKETS.unassigned}
                selection={{ kind: REVIEW_BUCKETS.unassigned }}
                onSelect={onSelect}
                title="Unassigned"
                files={meta.unassigned.files}
                pinned
                viewedPaths={viewedPaths}
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
                pinned
                viewedPaths={viewedPaths}
              />
            </li>
          ) : null}
        </ul>
      ) : null}
    </nav>
  );
}

function StackItem(props: {
  active: boolean;
  selection: Selection;
  onSelect: (selection: Selection) => void;
  title: string;
  files?: readonly string[];
  note?: string;
  stale?: number;
  attention?: AttentionKind;
  change?: ChangeMark;
  index?: string;
  /** Lives outside the scrolling list, so it shows its own selection, not the sliding one. */
  pinned?: boolean;
  colorIndex?: number;
  viewedPaths: ReadonlySet<string>;
}) {
  const colorIndex = props.colorIndex;
  const files = props.files ?? [];
  const stale = props.stale ?? 0;
  const reading = readingStatus(files, props.viewedPaths);
  const showStrand = colorIndex !== undefined || props.active;
  const strand =
    colorIndex !== undefined
      ? partColor(colorIndex)
      : props.pinned === true
        ? "var(--muted-foreground)"
        : undefined;
  const done = reading !== null && reading.left === 0;
  const label = stackLabel({
    title: props.title,
    files,
    note: props.note,
    stale,
    attention: props.attention,
    change: props.change,
    reading,
  });
  return (
    <HashLink
      selection={props.selection}
      onSelect={props.onSelect}
      ariaLabel={label}
      ariaCurrent={props.active ? "page" : undefined}
      className={cn(
        "group relative z-1 mx-2 mb-0.5 flex h-auto w-[calc(100%-16px)] min-w-0 items-start justify-start gap-2 rounded-md px-2.5 py-1.5 text-left font-normal whitespace-normal no-underline min-[800px]:mx-3 min-[800px]:w-[calc(100%-24px)] min-[800px]:gap-2.5 min-[800px]:px-3 min-[800px]:py-2",
        !props.active && "hover:bg-accent/60",
        props.active && "text-foreground",
        props.active && (props.pinned === true ? "bg-accent" : styles.itemActive),
      )}
    >
      {showStrand ? (
        <span
          className="pointer-events-none absolute inset-y-2 left-0 z-1 w-[3px] rounded-full bg-[var(--strand,var(--primary))]"
          style={strand !== undefined ? ({ "--strand": strand } as CSSProperties) : undefined}
          aria-hidden
        />
      ) : null}
      {props.index !== undefined ? (
        <span className="mt-px w-5 shrink-0 text-xs leading-5 text-muted-foreground tabular-nums">
          {props.index}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 text-left">
        <span className="flex min-w-0 items-start gap-2">
          <span
            className={cn(
              "min-w-0 flex-1 text-sm leading-5",
              done && !props.active && "text-muted-foreground",
            )}
          >
            {props.title}
            {props.change !== undefined ? (
              <Badge
                variant={props.change === "New" ? "new" : "changed"}
                size="sm"
                className="ml-2 translate-y-[-1px] align-middle"
              >
                {props.change}
              </Badge>
            ) : null}
          </span>
          {reading !== null ? (
            <ReadingMark paths={files} viewed={props.viewedPaths} className="leading-5" />
          ) : null}
          {props.attention !== undefined ? (
            <AttentionMark kind={props.attention} side="right" />
          ) : null}
        </span>
        <FilePeek paths={files} />
        {props.note !== undefined ? (
          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
            {props.note}
          </span>
        ) : null}
        {stale > 0 ? (
          <span className="mt-1 block text-xs leading-snug text-warn">
            {stale} {stale === 1 ? "stale hunk" : "stale hunks"}
          </span>
        ) : null}
      </span>
    </HashLink>
  );
}

function stackLabel(item: {
  title: string;
  files: readonly string[];
  note?: string;
  stale: number;
  attention?: AttentionKind;
  change?: ChangeMark;
  reading: ReadingStatus | null;
}): string {
  const parts = [item.title];
  if (item.change !== undefined) {
    parts.push(item.change.toLowerCase());
  }
  if (item.files.length > 0) {
    parts.push(`${item.files.length} ${item.files.length === 1 ? "file" : "files"}`);
  }
  if (item.note !== undefined) {
    parts.push(item.note);
  }
  if (item.stale > 0) {
    parts.push(`${item.stale} stale`);
  }
  if (item.attention !== undefined) {
    parts.push(ATTENTION_TITLES[item.attention]);
  }
  if (item.reading !== null) {
    parts.push(item.reading.filesLabel);
  }
  return parts.join(", ");
}
