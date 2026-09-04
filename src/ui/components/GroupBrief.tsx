import type { ReactNode } from "react";
import { groupIndex, type ReviewMeta } from "../api.ts";
import { padIndex } from "../../schema/types.ts";
import { Button } from "@/components/ui/button.tsx";
import { groupSourceIds } from "../../schema/source.ts";
import { askAgentPrompt } from "../lib/agent-prompt.ts";
import { CopyPrompt } from "./CopyPrompt.tsx";
import { InlineMd } from "./InlineMd.tsx";
import { Kicker } from "./Kicker.tsx";
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
      <h1 className="mb-3 font-display text-[2.5rem] leading-[1.15] tracking-[-0.015em] text-balance text-foreground">
        {props.title}
      </h1>
      {props.children}
    </div>
  );
}

export function GroupBrief(props: {
  group: ReviewMeta["groups"][number];
  index: number;
  groups: ReviewMeta["groups"];
  document: ReviewMeta["document"];
  partTitle?: string;
  onOpenGroup: (id: string) => void;
}) {
  const { group, index, groups, document, partTitle, onOpenGroup } = props;
  const listed = document.groups.find((item) => item.id === group.id);
  const sourceIds = listed !== undefined ? groupSourceIds(listed) : group.sources;
  return (
    <Brief
      kicker={partTitle !== undefined ? `${partTitle} · ${padIndex(index)}` : padIndex(index)}
      title={group.title}
      kickerExtra={<CopyPrompt prompt={askAgentPrompt({ group: group.id })} scope="group" />}
    >
      <div>
        <Kicker className="mb-2">Why</Kicker>
        <p className="mb-6 font-display text-xl leading-relaxed text-pretty text-foreground">
          <InlineMd text={group.why} />
        </p>
        <Kicker className="mb-2">What</Kicker>
        <p className="mb-5 leading-relaxed text-pretty text-foreground">
          <InlineMd text={group.summary} />
        </p>
        <SourceList ids={sourceIds} sources={document.sources ?? []} />
        {group.dependsOn.length > 0 ? (
          <p className="mb-5 text-muted-foreground">
            Depends on{" "}
            {group.dependsOn.map((id, i) => {
              const dep = groups.find((item) => item.id === id);
              const label = dep !== undefined ? `${padIndex(groupIndex(groups, id))} ${dep.title}` : id;
              return (
                <span key={id}>
                  {i > 0 ? ", " : ""}
                  <Button type="button" variant="link" className="h-auto p-0" onClick={() => onOpenGroup(id)}>
                    {label}
                  </Button>
                </span>
              );
            })}
          </p>
        ) : null}
        {group.lookFor.length > 0 ? (
          <ul className="mb-2 list-disc space-y-2 pl-5 leading-relaxed">
            {group.lookFor.map((item, i) => (
              <li key={i}>
                <InlineMd text={item} />
              </li>
            ))}
          </ul>
        ) : null}
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
