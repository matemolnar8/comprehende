import { useRef, type ReactNode } from "react";
import { ArrowRightIcon, InfoIcon } from "lucide-react";
import { type ReviewMeta } from "../api.ts";
import { padIndex, sizeLabel } from "../../schema/types.ts";
import { cn } from "@/lib/utils.ts";
import { askAgentPrompt } from "../lib/agent-prompt.ts";
import { groupOrderIndex, isMixedReview, partColor, partSummary, type Part } from "../lib/parts.ts";
import { readingStatus, reviewReadingPaths, skippedBinaryNote } from "../lib/reading-progress.ts";
import { useScrollEdges } from "../lib/scroll-edges.ts";
import type { Selection } from "../lib/selection.ts";
import { shortSha } from "../api.ts";
import { Brief, ProseField } from "./GroupBrief.tsx";
import { AskAgent } from "./AskAgent.tsx";
import { AttentionMark } from "./Attention.tsx";
import { HashLink, hashLinkText } from "./HashLink.tsx";
import { InlineMd } from "./InlineMd.tsx";
import { Kbd } from "./Kbd.tsx";
import {
  BriefField,
  briefProse,
  briefRail,
  contentColumn,
  labelText,
  scrollFade,
  splitAside,
  splitMain,
  splitRoot,
  splitRow,
  stackedNoFade,
} from "./Kicker.tsx";
import { LookForList } from "./LookForList.tsx";
import { SourceList } from "./SourceList.tsx";
import { buttonVariants } from "@/components/ui/button.tsx";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip.tsx";

function SkippedFiles(props: { paths: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Skipped files"
          className="inline-flex size-3.5 items-center justify-center border-0 bg-transparent p-0 text-muted-foreground hover:text-foreground"
        >
          <InfoIcon aria-hidden className="size-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs border border-border bg-popover px-3 py-2 text-xs leading-[1.45] text-popover-foreground shadow-card">
        Skipped: <span className="font-mono">{props.paths}</span>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Up to this many groups, the Overview is one column with Things to check above Groups, so the
 * group list cannot push the checks down. More groups use the split.
 */
const SINGLE_COLUMN_MAX_GROUPS = 4;

export function Overview(props: {
  meta: ReviewMeta;
  parts: Part[];
  viewedPaths: ReadonlySet<string>;
  onSelect: (selection: Selection) => void;
  focusClaimKey?: string;
}) {
  const { meta, parts, viewedPaths, onSelect, focusClaimKey } = props;
  const onOpenGroup = (id: string) => onSelect({ kind: "group", id });
  const since = meta.changes?.since.headSha;
  const mixed = isMixedReview(parts);
  const byId = new Map(meta.groups.map((group) => [group.id, group]));
  const sources = meta.document.sources ?? [];
  const groupCount = meta.groups.length;
  const fileCount = reviewReadingPaths(meta).length;
  const skipped = skippedBinaryNote(meta.skipped);
  const firstId = parts[0]?.groupIds[0];
  const first = firstId === undefined ? undefined : byId.get(firstId);
  const singleColumn = !mixed && groupCount <= SINGLE_COLUMN_MAX_GROUPS;

  const groupList = (
    <div className="flex flex-col gap-7">
      {parts.map((part) => (
        <PartSection
          key={part.groupIds.join("\0")}
          part={part}
          parts={parts}
          mixed={mixed}
          listedParts={meta.document.parts}
          byId={byId}
          viewedPaths={viewedPaths}
          onOpenGroup={onOpenGroup}
        />
      ))}
    </div>
  );

  const brief = (
    <Brief
      kicker={
        <>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default">
                {groupCount} {groupCount === 1 ? "group" : "groups"} · {fileCount}{" "}
                {fileCount === 1 ? "file" : "files"}
              </span>
            </TooltipTrigger>
            <TooltipContent>{reviewSizeLabel(meta.document.size)}</TooltipContent>
          </Tooltip>
          {skipped !== null ? <SkippedFiles paths={skipped} /> : null}
          {meta.changes !== undefined ? (
            <>
              <span aria-hidden>·</span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <HashLink
                      selection={{ kind: "changes" }}
                      onSelect={onSelect}
                      className={cn("text-primary", hashLinkText)}
                    >
                      {since === undefined
                        ? "What changed"
                        : `What changed since ${shortSha(since)}`}
                    </HashLink>
                  </span>
                </TooltipTrigger>
                <TooltipContent className="flex items-center gap-2">
                  Open the changes since the last review <Kbd>h</Kbd>
                </TooltipContent>
              </Tooltip>
            </>
          ) : null}
        </>
      }
      title={meta.document.title}
      titleSize="overview"
      className="min-w-0 flex-1"
      kickerExtra={<AskAgent prompt={askAgentPrompt("overview")} scope="overview" />}
    >
      {first !== undefined ? (
        <p className="mt-1 mb-6 flex min-w-0">
          <HashLink
            selection={{ kind: "group", id: first.id }}
            onSelect={() => onOpenGroup(first.id)}
            className={cn(buttonVariants({ size: "sm" }), "max-w-full")}
          >
            <span className="min-w-0 truncate">
              Start with {padIndex(groupOrderIndex(parts, first.id))} {first.title}
            </span>
            <ArrowRightIcon aria-hidden />
          </HashLink>
        </p>
      ) : null}
      <ProseField kicker="Why" kickerId="review-why" text={meta.document.why} />
      <ProseField kicker="What" kickerId="review-what" text={meta.document.summary} />
      <LookForList items={meta.document.lookFor ?? []} focusKey={focusClaimKey} />
      {singleColumn ? (
        <BriefField kicker="Groups" className="mt-8">
          {groupList}
        </BriefField>
      ) : null}
      <SourceList
        ids={sources.map((source) => source.id)}
        sources={sources}
        mixed={mixed}
        parts={parts}
      />
    </Brief>
  );

  const rootClass = cn(
    splitRoot,
    "mb-5 [[data-motion=group]_&]:[view-transition-name:review-overview]",
  );

  if (singleColumn) {
    return (
      <div className={rootClass}>
        <div className="mx-auto max-w-[42rem]">{brief}</div>
      </div>
    );
  }

  return <SplitOverview className={rootClass} brief={brief} groupList={groupList} />;
}

/** The brief in a sticky column beside the group list. */
function SplitOverview(props: { className: string; brief: ReactNode; groupList: ReactNode }) {
  const asideRef = useRef<HTMLElement>(null);
  useScrollEdges(asideRef);
  return (
    <div className={props.className}>
      <div className={splitRow}>
        <aside
          ref={asideRef}
          className={cn(
            splitAside("overview"),
            scrollFade,
            stackedNoFade,
            "flex items-stretch gap-3 min-[800px]:gap-4",
          )}
        >
          <span aria-hidden className={cn(briefRail, "bg-border")} />
          {props.brief}
        </aside>
        <div
          className={cn(
            splitMain,
            contentColumn,
            "mt-8 @min-[60rem]/review:mt-0 @min-[60rem]/review:max-w-none",
          )}
        >
          <h2 className={cn("mb-1.5 flex min-h-8 items-center", labelText)}>Groups</h2>
          {props.groupList}
        </div>
      </div>
    </div>
  );
}

function reviewSizeLabel(size: ReviewMeta["document"]["size"]): string {
  const label = sizeLabel(size);
  return `${label.charAt(0).toUpperCase()}${label.slice(1)} review`;
}

function PartSection(props: {
  part: Part;
  parts: Part[];
  mixed: boolean;
  listedParts: ReviewMeta["document"]["parts"];
  byId: Map<string, ReviewMeta["groups"][number]>;
  viewedPaths: ReadonlySet<string>;
  onOpenGroup: (id: string) => void;
}) {
  const { part, parts, mixed, listedParts, byId, viewedPaths, onOpenGroup } = props;
  const firstId = part.groupIds[0];
  const summary = part.groupIds.length > 1 ? partSummary(listedParts, part.title) : undefined;
  return (
    <section className="min-w-0" aria-label={part.title ?? "Groups"}>
      {mixed && part.title !== undefined && firstId !== undefined ? (
        <header className="mb-2.5">
          <HashLink
            selection={{ kind: "group", id: firstId }}
            onSelect={() => onOpenGroup(firstId)}
            className="inline-flex min-h-8 items-center gap-2 rounded-sm text-sm leading-[1.45] font-semibold text-foreground underline-offset-2 hover:underline"
            ariaLabel={`Open part ${part.title}`}
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{ backgroundColor: partColor(part.colorIndex) }}
            />
            {part.title}
          </HashLink>
          {summary !== undefined ? (
            <p className={cn(briefProse, "text-muted-foreground")}>
              <InlineMd text={summary} />
            </p>
          ) : null}
        </header>
      ) : null}
      <div className="flex items-stretch gap-3">
        <span
          aria-hidden
          className={briefRail}
          style={{
            backgroundColor: mixed ? partColor(part.colorIndex) : "var(--muted-foreground)",
          }}
        />
        <ol className="m-0 flex min-w-0 flex-1 list-none flex-col p-0">
          {part.groupIds.map((id) => {
            const group = byId.get(id);
            if (group === undefined) {
              return null;
            }
            const needs = (group.dependsOn ?? []).flatMap((dep) => {
              const index = groupOrderIndex(parts, dep);
              const title = byId.get(dep)?.title;
              return index > 0
                ? [title === undefined ? padIndex(index) : `${padIndex(index)} ${title}`]
                : [];
            });
            const reading = readingStatus(group.files, viewedPaths);
            const done = reading !== null && reading.left === 0;
            const fileCount = group.files.length;
            return (
              <li key={group.id}>
                <HashLink
                  selection={{ kind: "group", id: group.id }}
                  onSelect={() => onOpenGroup(group.id)}
                  className="flex w-full min-w-0 items-start gap-3 rounded-md px-2 py-2 text-left no-underline transition-colors duration-[var(--motion)] ease-[var(--motion-ease)] hover:bg-accent/50"
                >
                  <span className="w-5 shrink-0 text-xs leading-5 font-medium tabular-nums text-muted-foreground">
                    {padIndex(groupOrderIndex(parts, id))}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-start gap-1.5">
                      <strong
                        className={cn(
                          "min-w-0 text-sm leading-5 font-medium text-foreground",
                          done && "text-muted-foreground",
                        )}
                      >
                        {group.title}
                      </strong>
                      {group.attention !== undefined ? (
                        <AttentionMark kind={group.attention.kind} />
                      ) : null}
                      {fileCount > 0 ? (
                        <span className="shrink-0 text-xs leading-5 text-muted-foreground tabular-nums">
                          · {fileCount} {fileCount === 1 ? "file" : "files"}
                        </span>
                      ) : null}
                    </span>
                    {needs.length > 0 ? (
                      <span className="mt-0.5 block max-w-[72ch] text-[13px] leading-[1.5] text-muted-foreground">
                        Depends on {needs.join(", ")}
                      </span>
                    ) : null}
                    {group.summary.trim() !== "" ? (
                      <span className="mt-0.5 line-clamp-2 max-w-[72ch] text-[13px] leading-[1.5] text-muted-foreground">
                        <InlineMd text={group.summary} />
                      </span>
                    ) : null}
                  </span>
                </HashLink>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
