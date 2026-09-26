import type { CSSProperties } from "react";
import { type ReviewMeta } from "../api.ts";
import { padIndex, sizeLabel } from "../../schema/types.ts";
import { cn } from "@/lib/utils.ts";
import { askAgentPrompt } from "../lib/agent-prompt.ts";
import { claimsFromLookFor } from "../lib/look-for.ts";
import { dependsOnDepth, groupOrderIndex, isMixedReview, partColor, partSummary, type Part } from "../lib/parts.ts";
import { readingStatus, reviewReadingPaths, skippedBinaryNote } from "../lib/reading-progress.ts";
import { Brief } from "./GroupBrief.tsx";
import { CopyPrompt } from "./CopyPrompt.tsx";
import { HashLink } from "./HashLink.tsx";
import { InlineMd } from "./InlineMd.tsx";
import { BriefField, briefProse } from "./Kicker.tsx";
import { LookForList } from "./LookForList.tsx";
import { ReadingMark } from "./ReadingMark.tsx";
import { SourceList } from "./SourceList.tsx";

export function Overview(props: {
  meta: ReviewMeta;
  parts: Part[];
  viewedPaths: ReadonlySet<string>;
  onOpenGroup: (id: string) => void;
  focusLookForKey?: string;
}) {
  const { meta, parts, viewedPaths, onOpenGroup, focusLookForKey } = props;
  const mixed = isMixedReview(parts);
  const byId = new Map(meta.groups.map((group) => [group.id, group]));
  const why = meta.document.why;
  const sources = meta.document.sources ?? [];
  const fileCount = reviewReadingPaths(meta).length;
  const skipped = skippedBinaryNote(meta.skipped);

  return (
    <div className="mb-5 [[data-motion=group]_&]:[view-transition-name:review-overview]">
      <Brief
        kicker={
          <>
            {sizeLabel(meta.document.size)} · {fileCount} {fileCount === 1 ? "file" : "files"}
            {skipped !== null ? <span className="text-muted-foreground/70"> · {skipped}</span> : null}
          </>
        }
        title={meta.document.title}
        kickerExtra={<CopyPrompt prompt={askAgentPrompt("overview")} scope="overview" />}
      >
        {why !== undefined ? (
          <BriefField kicker="Why" kickerId="review-why">
            <p className={briefProse}>
              <InlineMd text={why} />
            </p>
          </BriefField>
        ) : null}
        <BriefField kicker="What" kickerId="review-what">
          <p className={briefProse}>
            <InlineMd text={meta.document.summary} />
          </p>
        </BriefField>
        <LookForList
          claims={claimsFromLookFor({ kind: "document" }, meta.document.lookFor)}
          focusKey={focusLookForKey}
        />
        <SourceList ids={sources.map((source) => source.id)} sources={sources} mixed={mixed} parts={parts} />
      </Brief>
      <div
        className={
          mixed ? "mt-8 grid grid-flow-col auto-cols-[minmax(16rem,1fr)] items-start gap-4 overflow-x-auto pb-1" : "mt-8"
        }
      >
        {parts.map((part) => (
          <PartColumn
            key={part.groupIds.join("\0")}
            part={part}
            parts={parts}
            mixed={mixed}
            groups={meta.groups}
            listedParts={meta.document.parts}
            byId={byId}
            viewedPaths={viewedPaths}
            onOpenGroup={onOpenGroup}
          />
        ))}
      </div>
    </div>
  );
}

function PartColumn(props: {
  part: Part;
  parts: Part[];
  mixed: boolean;
  groups: ReviewMeta["groups"];
  listedParts: ReviewMeta["document"]["parts"];
  byId: Map<string, ReviewMeta["groups"][number]>;
  viewedPaths: ReadonlySet<string>;
  onOpenGroup: (id: string) => void;
}) {
  const { part, mixed, groups, listedParts, byId, viewedPaths, onOpenGroup } = props;
  const color = partColor(part.colorIndex);
  const firstId = part.groupIds[0];
  const summary = partSummary(listedParts, part.title);
  return (
    <section
      className={cn("min-w-0", mixed && "rounded-md border border-border py-2")}
      style={mixed ? partStyle(color) : undefined}
      aria-label={part.title}
    >
      {mixed && part.title !== undefined && firstId !== undefined ? (
        <header className="mb-1 px-4 pt-2">
          <HashLink
            selection={{ kind: "group", id: firstId }}
            onSelect={() => onOpenGroup(firstId)}
            className="flex w-full items-center gap-2 text-left font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground"
            ariaLabel={`Open part ${part.title}`}
          >
            <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <span>{part.title}</span>
          </HashLink>
          {summary !== undefined ? (
            <span className="mt-0.5 block leading-[1.45] text-muted-foreground line-clamp-2">
              <InlineMd text={summary} />
            </span>
          ) : null}
        </header>
      ) : null}
      <ol className={cn("m-0 list-none p-0", !mixed && "divide-y divide-border")}>
        {part.groupIds.map((id) => {
          const group = byId.get(id);
          if (group === undefined) {
            return null;
          }
          const index = groupOrderIndex(props.parts, id);
          const depth = dependsOnDepth(groups, id, new Set(part.groupIds));
          const reading = readingStatus(group.files, viewedPaths);
          return (
            <li key={group.id} className={mixed ? "mb-2 last:mb-0" : undefined}>
              <HashLink
                selection={{ kind: "group", id: group.id }}
                onSelect={() => onOpenGroup(group.id)}
                className={cn(
                  "group flex h-auto w-full min-w-0 items-start justify-start rounded-md px-4 text-left font-normal whitespace-normal no-underline",
                  "gap-3 rounded-none py-2.5 min-[800px]:py-3",
                  mixed && "rounded-md",
                )}
                style={depth > 0 ? { paddingInlineStart: `${16 + Math.min(depth, 3) * 12}px` } : undefined}
              >
                <span className="mt-px w-5 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
                  {padIndex(index)}
                </span>
                <span className="min-w-0 flex-1">
                  <strong
                    className={cn("block font-medium text-foreground", reading !== null && reading.left === 0 && "opacity-60")}
                  >
                    {group.title}
                  </strong>
                  <span className="mt-0.5 block leading-[1.45] text-muted-foreground line-clamp-2">
                    <InlineMd text={group.summary} />
                  </span>
                </span>
                {reading !== null ? <ReadingMark paths={group.files} viewed={viewedPaths} /> : null}
              </HashLink>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function partStyle(color: string): CSSProperties {
  return {
    "--strand": color,
    borderLeftWidth: 3,
    borderLeftColor: color,
    backgroundColor: `color-mix(in srgb, ${color} 5%, var(--card))`,
  } as CSSProperties;
}
