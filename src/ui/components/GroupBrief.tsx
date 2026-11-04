import type { ReactNode } from "react";
import { type ReviewMeta } from "../api.ts";
import { padIndex } from "../../schema/types.ts";
import { groupSourceIds } from "../../schema/source.ts";
import { askAgentPrompt } from "../lib/agent-prompt.ts";
import { hyphenRuns } from "../lib/hyphen-runs.ts";
import { groupOrderIndex, groupParts, isMixedReview, type Part } from "../lib/parts.ts";
import { storyNav, type StoryHop } from "../lib/story-nav.ts";
import { AskAgent } from "./AskAgent.tsx";
import { HashLink, hashLinkText } from "./HashLink.tsx";
import { InlineMd } from "./InlineMd.tsx";
import { cn } from "@/lib/utils.ts";
import { BriefField, briefProse, Kicker } from "./Kicker.tsx";
import { AttentionAlert } from "./Attention.tsx";
import { QuestionList } from "./QuestionList.tsx";
import { SourceList } from "./SourceList.tsx";

/* Plain strings: tailwind-merge reads text-title-* as a colour and drops it next to text-foreground. */
const TITLE_SIZE = {
  page: "text-title-sm min-[800px]:text-title",
  overview: "text-title-sm min-[800px]:text-title-md",
};

export function Brief(props: {
  kicker?: ReactNode;
  title: string;
  titleSize?: keyof typeof TITLE_SIZE;
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
      <h1
        className={`mb-3 font-display tracking-[-0.015em] text-balance text-foreground ${TITLE_SIZE[props.titleSize ?? "page"]}`}
      >
        {hyphenRuns(props.title).map((run, i) =>
          run.hyphenated ? (
            <span key={i} className="whitespace-nowrap">
              {run.text}
            </span>
          ) : (
            run.text
          ),
        )}
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
  focusClaimKey?: string;
}) {
  const { group, groups, document, onOpenGroup, focusClaimKey } = props;
  const parts = groupParts(groups);
  const mixed = isMixedReview(parts);
  const index = groupOrderIndex(parts, group.id);
  const nav = storyNav(groups, group.id);
  const listed = document.groups.find((item) => item.id === group.id);
  const sourceIds = listed !== undefined ? groupSourceIds(listed) : group.sources;
  const partTitle = mixed ? group.part : undefined;
  return (
    <Brief
      kicker={partTitle !== undefined ? `${padIndex(index)} · ${partTitle}` : padIndex(index)}
      title={group.title}
      kickerExtra={<AskAgent prompt={askAgentPrompt({ group: group.id })} scope="group" />}
    >
      <div>
        <ProseField kicker="Why" text={group.why} />
        <ProseField kicker="What" text={group.summary} />
        {group.attention !== undefined ? (
          <AttentionAlert groupId={group.id} attention={group.attention} focusKey={focusClaimKey} />
        ) : null}
        <QuestionList groupId={group.id} questions={group.questions} />
        <SourceList
          ids={sourceIds}
          sources={document.sources ?? []}
          trailing={
            nav.dependsOn.length > 0 || nav.dependents.length > 0 ? (
              <>
                <HopList
                  label="Depends on"
                  hops={nav.dependsOn}
                  parts={parts}
                  onOpenGroup={onOpenGroup}
                />
                <HopList
                  label="Needed by"
                  hops={nav.dependents}
                  parts={parts}
                  onOpenGroup={onOpenGroup}
                />
              </>
            ) : undefined
          }
        />
        {group.staleCount > 0 ? (
          <p className={cn(briefProse, "mt-3 text-warn")}>
            {group.staleCount} hunk ref{group.staleCount === 1 ? "" : "s"} no longer match live git.
            Git wins; the pointer is flagged, not replaced.
          </p>
        ) : null}
      </div>
    </Brief>
  );
}

/** A prose field. It is hidden when the text is empty, as in a skeleton review. */
export function ProseField(props: { kicker: string; text: string | undefined; kickerId?: string }) {
  if (props.text === undefined || props.text.trim() === "") {
    return null;
  }
  return (
    <BriefField kicker={props.kicker} kickerId={props.kickerId}>
      <p className={briefProse}>
        <InlineMd text={props.text} />
      </p>
    </BriefField>
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
    <p className="m-0 flex min-w-0 items-baseline gap-1.5 text-[13px] leading-[1.45]">
      <span className="shrink-0 text-muted-foreground">{props.label}</span>
      <span className="min-w-0">
        {props.hops.map((hop, i) => {
          const index = groupOrderIndex(props.parts, hop.id);
          const label = index > 0 ? `${padIndex(index)} ${hop.title}` : hop.title;
          return (
            <span key={hop.id}>
              {i > 0 ? ", " : ""}
              <HashLink
                selection={{ kind: "group", id: hop.id }}
                onSelect={() => props.onOpenGroup(hop.id)}
                className={`text-primary ${hashLinkText}`}
              >
                {label}
              </HashLink>
            </span>
          );
        })}
      </span>
    </p>
  );
}
