import type { ReactNode } from "react";
import { ChevronRightIcon } from "lucide-react";
import type {
  ApiAttentionChange,
  ApiChanges,
  ApiGroupChange,
  ApiHunkCounts,
  ApiListChange,
  ApiTextChange,
  ApiTextChanges,
} from "../../api/types.ts";
import { shortSha, type ReviewMeta } from "../api.ts";
import type { Selection } from "../lib/selection.ts";
import type { Attention } from "../../schema/types.ts";
import { Badge } from "@/components/ui/badge.tsx";
import { cn } from "@/lib/utils.ts";
import { ATTENTION_TITLES } from "./Attention.tsx";
import { Brief } from "./GroupBrief.tsx";
import { HashLink } from "./HashLink.tsx";
import { InlineMd } from "./InlineMd.tsx";
import { BriefField, briefProse, contentColumn } from "./Kicker.tsx";

const TEXT_LABELS = { title: "Title", summary: "What", why: "Why" } as const;

export function Changes(props: {
  changes: ApiChanges;
  groups: ReviewMeta["groups"];
  onSelect: (selection: Selection) => void;
}) {
  const { changes, onSelect } = props;
  const summaries = new Map(props.groups.map((group) => [group.id, group.summary]));
  const since = changes.since.headSha;
  const hunks = changes.hunks === undefined ? null : hunkCountsLabel(changes.hunks);
  const quiet =
    changes.groups.length === 0 &&
    Object.keys(changes.text).length === 0 &&
    isEmpty(changes.lookFor) &&
    isEmpty(changes.sources);
  return (
    <Brief
      kicker={[since === undefined ? "Since the last review" : `Since ${shortSha(since)}`, hunks]
        .filter((part) => part !== null)
        .join(" · ")}
      title="What changed"
      className={contentColumn}
    >
      <TextFields text={changes.text} />
      <ListField label="Things to check" change={changes.lookFor} />
      <ListField label="Sources" change={changes.sources} />
      {quiet ? (
        <p className={cn(briefProse, "text-muted-foreground")}>The review text is the same.</p>
      ) : null}
      {changes.groups.length > 0 ? (
        <BriefField kicker="Groups">
          <ol className="m-0 list-none divide-y divide-border overflow-hidden rounded-lg border border-border bg-card p-0">
            {changes.groups.map((group) => (
              <GroupChange
                key={`${group.state}\0${group.id}`}
                group={group}
                summary={group.state === "added" ? summaries.get(group.id) : undefined}
                onSelect={onSelect}
              />
            ))}
          </ol>
        </BriefField>
      ) : null}
    </Brief>
  );
}

function GroupChange(props: {
  group: ApiGroupChange;
  summary: string | undefined;
  onSelect: (selection: Selection) => void;
}) {
  const { group, summary, onSelect } = props;
  const hunks = group.hunks === undefined ? null : hunkCountsLabel(group.hunks);
  const removed = group.state === "removed";
  const heading = (
    <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <strong
        className={cn(
          "font-medium",
          removed ? "text-muted-foreground line-through decoration-del/60" : "text-foreground",
        )}
      >
        {group.title}
      </strong>
      {group.state === "added" ? (
        <Badge variant="new" size="sm">
          New group
        </Badge>
      ) : null}
      {removed ? (
        <Badge variant="neutral" size="sm">
          Removed
        </Badge>
      ) : null}
      {hunks !== null ? <Tag>{hunks}</Tag> : null}
    </span>
  );
  return (
    <li>
      {removed ? (
        <div className="px-4 py-3">{heading}</div>
      ) : (
        <HashLink
          selection={{ kind: "group", id: group.id }}
          onSelect={onSelect}
          className="flex items-start gap-3 px-4 py-3 transition-colors duration-[var(--motion)] ease-[var(--motion-ease)] hover:bg-accent/60"
        >
          <span className="min-w-0 flex-1">
            {heading}
            {summary !== undefined && summary.trim() !== "" ? (
              <span className={cn(briefProse, "mt-1 block text-muted-foreground")}>
                <InlineMd text={summary} />
              </span>
            ) : null}
          </span>
          <ChevronRightIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        </HashLink>
      )}
      {group.state === "added" ? (
        <div className="px-4 pb-3 empty:hidden">
          {group.attention !== undefined ? <AttentionField change={group.attention} /> : null}
          <ListField label="Questions" change={group.questions} />
        </div>
      ) : null}
      {group.state === "kept" ? (
        <div className="px-4 pb-3 empty:hidden">
          <TextFields text={group.text} />
          {group.attention !== undefined ? <AttentionField change={group.attention} /> : null}
          <ListField label="Questions" change={group.questions} />
          <ListField label="Files" change={group.files} mono />
        </div>
      ) : null}
    </li>
  );
}

function TextFields(props: { text: ApiTextChanges }) {
  return (["title", "summary", "why"] as const).map((key) => {
    const change = props.text[key];
    return change === undefined ? null : (
      <BriefField key={key} kicker={TEXT_LABELS[key]}>
        <TextChange change={change} />
      </BriefField>
    );
  });
}

function TextChange(props: { change: ApiTextChange }) {
  const { before, after } = props.change;
  return (
    <>
      {before !== "" ? (
        <p className={cn(briefProse, "text-muted-foreground line-through decoration-del/60")}>
          <InlineMd text={before} />
        </p>
      ) : null}
      {after !== "" ? (
        <p className={cn(briefProse, before !== "" && "mt-1")}>
          <InlineMd text={after} />
        </p>
      ) : null}
    </>
  );
}

function AttentionField(props: { change: ApiAttentionChange }) {
  const { before, after } = props.change;
  return (
    <BriefField kicker="Attention">
      {before !== null ? <AttentionText attention={before} removed /> : null}
      {after !== null ? (
        <AttentionText attention={after} className={cn(before !== null && "mt-1")} />
      ) : null}
    </BriefField>
  );
}

function AttentionText(props: { attention: Attention; removed?: boolean; className?: string }) {
  const { attention, removed = false } = props;
  return (
    <p
      className={cn(
        briefProse,
        removed && "text-muted-foreground line-through decoration-del/60",
        props.className,
      )}
    >
      <span className={cn("mr-2 text-xs font-medium", !removed && "text-warn")}>
        {ATTENTION_TITLES[attention.kind]}
      </span>{" "}
      <InlineMd text={attention.note} />
    </p>
  );
}

function ListField(props: { label: string; change: ApiListChange; mono?: boolean }) {
  const { label, change, mono = false } = props;
  if (isEmpty(change)) {
    return null;
  }
  const row = (sign: "+" | "−", item: string): ReactNode => (
    <li
      key={`${sign}${item}`}
      className={cn(
        "grid grid-cols-[1rem_minmax(0,1fr)] items-baseline",
        sign === "−" && "text-muted-foreground",
      )}
    >
      <span
        aria-label={sign === "+" ? "added" : "removed"}
        className={sign === "+" ? "text-add" : "text-del"}
      >
        {sign}
      </span>
      <span
        className={cn(
          briefProse,
          mono && "font-mono text-xs",
          sign === "−" && "text-muted-foreground line-through decoration-del/60",
        )}
      >
        {mono ? item : <InlineMd text={item} />}
      </span>
    </li>
  );
  return (
    <BriefField kicker={label}>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {change.added.map((item) => row("+", item))}
        {change.removed.map((item) => row("−", item))}
      </ul>
    </BriefField>
  );
}

function Tag(props: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("text-xs font-medium text-muted-foreground", props.className)}>
      {props.children}
    </span>
  );
}

function isEmpty(change: ApiListChange): boolean {
  return change.added.length === 0 && change.removed.length === 0;
}

/** "2 new hunks · 1 changed hunk", or null when no hunk moved. */
export function hunkCountsLabel(counts: ApiHunkCounts & { gone?: number }): string | null {
  const counted = (["new", "changed", "reformat", "gone"] as const)
    .map((key) => [key, counts[key] ?? 0] as const)
    .filter(([, n]) => n > 0);
  if (counted.length === 0) {
    return null;
  }
  return counted
    .map(
      ([key, n]) =>
        `${n} ${key === "reformat" ? "reformatted" : key} ${n === 1 ? "hunk" : "hunks"}`,
    )
    .join(" · ");
}
