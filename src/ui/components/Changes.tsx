import type { ReactNode } from "react";
import type {
  ApiChanges,
  ApiGroupChange,
  ApiHunkCounts,
  ApiListChange,
  ApiTextChange,
  ApiTextChanges,
} from "../../api/types.ts";
import { shortSha, type ReviewMeta } from "../api.ts";
import type { Selection } from "../lib/selection.ts";
import { cn } from "@/lib/utils.ts";
import { Brief } from "./GroupBrief.tsx";
import { HashLink, hashLinkText } from "./HashLink.tsx";
import { InlineMd } from "./InlineMd.tsx";
import { BriefField, briefProse, briefRows } from "./Kicker.tsx";

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
    >
      <TextFields text={changes.text} />
      <ListField label="Look for" change={changes.lookFor} />
      <ListField label="Sources" change={changes.sources} />
      {quiet ? (
        <p className={cn(briefProse, "text-muted-foreground")}>The review text is the same.</p>
      ) : null}
      {changes.groups.length > 0 ? (
        <BriefField kicker="Groups">
          <ol className={briefRows}>
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
  return (
    <li className="py-3">
      <div className="flex items-baseline gap-2">
        {removed ? (
          <strong className="font-medium text-muted-foreground line-through">{group.title}</strong>
        ) : (
          <HashLink
            selection={{ kind: "group", id: group.id }}
            onSelect={onSelect}
            className={cn("font-medium text-foreground", hashLinkText)}
          >
            {group.title}
          </HashLink>
        )}
        {group.state === "added" ? <Tag className="text-add">new group</Tag> : null}
        {removed ? <Tag className="text-del">removed</Tag> : null}
        {hunks !== null ? <Tag>{hunks}</Tag> : null}
      </div>
      {summary !== undefined ? (
        <p className={cn(briefProse, "mt-1 text-muted-foreground")}>
          <InlineMd text={summary} />
        </p>
      ) : null}
      {group.state === "kept" ? (
        <div className="mt-2 empty:hidden">
          <TextFields text={group.text} />
          <ListField label="Look for" change={group.lookFor} />
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
          mono && "font-mono text-[12px]",
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
    <span className={cn("font-mono text-[11px] text-muted-foreground", props.className)}>
      {props.children}
    </span>
  );
}

function isEmpty(change: ApiListChange): boolean {
  return change.added.length === 0 && change.removed.length === 0;
}

/** "2 new · 1 changed hunks", or null when no hunk moved. */
export function hunkCountsLabel(counts: ApiHunkCounts & { gone?: number }): string | null {
  const counted = (["new", "changed", "reformat", "gone"] as const)
    .map((key) => [key, counts[key] ?? 0] as const)
    .filter(([, n]) => n > 0);
  if (counted.length === 0) {
    return null;
  }
  const total = counted.reduce((sum, [, n]) => sum + n, 0);
  const label = counted.map(([key, n]) => `${n} ${key}`).join(" · ");
  return `${label} ${total === 1 ? "hunk" : "hunks"}`;
}
