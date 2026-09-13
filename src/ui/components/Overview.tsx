import type { CSSProperties } from "react";
import { type ReviewMeta } from "../api.ts";
import { padIndex, sizeLabel } from "../../schema/types.ts";
import { cn } from "@/lib/utils.ts";
import { askAgentPrompt } from "../lib/agent-prompt.ts";
import { lookForClaims, type LookForClaim } from "../lib/look-for.ts";
import { dependsOnDepth, groupOrderIndex, isMixedReview, partColor, type Part } from "../lib/parts.ts";
import { Brief } from "./GroupBrief.tsx";
import { CopyPrompt } from "./CopyPrompt.tsx";
import { HashLink } from "./HashLink.tsx";
import { InlineMd } from "./InlineMd.tsx";
import { BriefField, briefProse } from "./Kicker.tsx";
import { LookForIndex } from "./LookForList.tsx";
import { SourceList } from "./SourceList.tsx";

export function Overview(props: {
  meta: ReviewMeta;
  parts: Part[];
  onOpenGroup: (id: string) => void;
  onOpenLookFor: (claim: LookForClaim) => void;
  focusLookForKey?: string;
}) {
  const { meta, parts, onOpenGroup, onOpenLookFor, focusLookForKey } = props;
  const mixed = isMixedReview(parts);
  const byId = new Map(meta.groups.map((group) => [group.id, group]));
  const why = meta.document.why;
  const sources = meta.document.sources ?? [];

  return (
    <div className="mb-5 [[data-motion=group]_&]:[view-transition-name:review-overview]">
      <Brief
        kicker={`${sizeLabel(meta.document.size)} · ${meta.files.length} files`}
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
        <LookForIndex
          claims={lookForClaims(meta.document, meta.groups)}
          focusKey={focusLookForKey}
          onOpen={onOpenLookFor}
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
            byId={byId}
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
  byId: Map<string, ReviewMeta["groups"][number]>;
  onOpenGroup: (id: string) => void;
}) {
  const { part, mixed, groups, byId, onOpenGroup } = props;
  const color = partColor(part.colorIndex);
  const firstId = part.groupIds[0];
  return (
    <section
      className={cn("min-w-0", mixed && "rounded-md border border-border py-2")}
      style={mixed ? partStyle(color) : undefined}
      aria-label={part.title}
    >
      {mixed && part.title !== undefined && firstId !== undefined ? (
        <HashLink
          selection={{ kind: "group", id: firstId }}
          onSelect={() => onOpenGroup(firstId)}
          className="mb-1 flex w-full items-center gap-2 px-4 pt-2 text-left font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground"
          ariaLabel={`Open part ${part.title}`}
        >
          <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span>{part.title}</span>
        </HashLink>
      ) : null}
      <ol className={cn("m-0 list-none p-0", !mixed && "divide-y divide-border")}>
        {part.groupIds.map((id) => {
          const group = byId.get(id);
          if (group === undefined) {
            return null;
          }
          const index = groupOrderIndex(props.parts, id);
          const depth = dependsOnDepth(groups, id, new Set(part.groupIds));
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
                  <strong className="block font-medium text-foreground">{group.title}</strong>
                  <span className="mt-0.5 block leading-[1.45] text-muted-foreground line-clamp-2">
                    <InlineMd text={group.summary} />
                  </span>
                </span>
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
    backgroundColor: `color-mix(in srgb, ${color} 8%, var(--card))`,
  } as CSSProperties;
}
