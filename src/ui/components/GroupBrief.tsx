import type { ReactNode } from "react";
import { type ReviewMeta } from "../api.ts";
import { padIndex } from "../../schema/types.ts";
import { Button } from "@/components/ui/button.tsx";
import { groupSourceIds } from "../../schema/source.ts";
import { askAgentPrompt } from "../lib/agent-prompt.ts";
import { groupOrderIndex, groupParts, isMixedReview, type Part } from "../lib/parts.ts";
import { storyNav, type StoryHop } from "../lib/story-nav.ts";
import { CopyPrompt } from "./CopyPrompt.tsx";
import { InlineMd } from "./InlineMd.tsx";
import { Kicker } from "./Kicker.tsx";
import { claimsFromLookFor } from "../lib/look-for.ts";
import { LookForList } from "./LookForList.tsx";
import { SourceList } from "./SourceList.tsx";

export function Brief(props: {
  kicker?: string;
  title: string;
  children?: ReactNode;
  className?: string;
  kickerExtra?: ReactNode;
}) {
  return (
    <div className={props.className}>
      {props.kicker !== undefined ? (
        props.kickerExtra !== undefined ? (
          <div className="mb-2 flex items-center justify-between gap-3">
            <Kicker>{props.kicker}</Kicker>
            {props.kickerExtra}
          </div>
        ) : (
          <Kicker className="mb-2">{props.kicker}</Kicker>
        )
      ) : null}
      <h1 className="mb-2 font-display text-[1.5rem] leading-[1.15] tracking-[-0.015em] text-balance text-foreground min-[800px]:mb-3 min-[800px]:text-[2.25rem]">
        {props.title}
      </h1>
      {props.children}
    </div>
  );
}

export function GroupBrief(props: {
  group: ReviewMeta["groups"][number];
  groups: ReviewMeta["groups"];
  document: ReviewMeta["document"];
  onOpenGroup: (id: string) => void;
  focusLookForKey?: string;
}) {
  const { group, groups, document, onOpenGroup, focusLookForKey } = props;
  const parts = groupParts(groups);
  const mixed = isMixedReview(parts);
  const index = groupOrderIndex(parts, group.id);
  const nav = storyNav(groups, group.id);
  const listed = document.groups.find((item) => item.id === group.id);
  const sourceIds = listed !== undefined ? groupSourceIds(listed) : group.sources;
  const partTitle = mixed ? group.part : undefined;
  const owner = {
    kind: "group" as const,
    id: group.id,
    title: group.title,
    index,
    ...(group.part !== undefined ? { part: group.part } : {}),
  };
  return (
    <Brief
      kicker={partTitle !== undefined ? `${partTitle} · ${padIndex(index)}` : padIndex(index)}
      title={group.title}
      kickerExtra={<CopyPrompt prompt={askAgentPrompt({ group: group.id })} scope="group" />}
    >
      <div>
        <Kicker className="mb-2">Why</Kicker>
        <p className="mb-4 font-display text-base leading-relaxed text-pretty text-foreground min-[800px]:mb-6 min-[800px]:text-lg">
          <InlineMd text={group.why} />
        </p>
        <Kicker className="mb-2">What</Kicker>
        <p className="mb-4 leading-relaxed text-pretty text-foreground min-[800px]:mb-5">
          <InlineMd text={group.summary} />
        </p>
        <SourceList ids={sourceIds} sources={document.sources ?? []} />
        <HopList label="Depends on" hops={nav.dependsOn} parts={parts} onOpenGroup={onOpenGroup} />
        <HopList label="Needed by" hops={nav.dependents} parts={parts} onOpenGroup={onOpenGroup} />
        <LookForList claims={claimsFromLookFor(owner, group.lookFor)} focusKey={focusLookForKey} />
        {group.staleCount > 0 ? (
          <p className="mt-4 text-warn">
            {group.staleCount} hunk ref{group.staleCount === 1 ? "" : "s"} no longer match live git. Git wins; the
            pointer is flagged, not replaced.
          </p>
        ) : null}
      </div>
    </Brief>
  );
}

function HopList(props: {
  label: string;
  hops: StoryHop[];
  parts: Part[];
  onOpenGroup: (id: string) => void;
}) {
  if (props.hops.length === 0) {
    return null;
  }
  return (
    <p className="mb-5 text-muted-foreground">
      {props.label}{" "}
      {props.hops.map((hop, i) => {
        const index = groupOrderIndex(props.parts, hop.id);
        const label = index > 0 ? `${padIndex(index)} ${hop.title}` : hop.title;
        return (
          <span key={hop.id}>
            {i > 0 ? ", " : ""}
            <Button type="button" variant="link" className="h-auto p-0" onClick={() => props.onOpenGroup(hop.id)}>
              {label}
            </Button>
          </span>
        );
      })}
    </p>
  );
}
