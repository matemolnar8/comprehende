import type { ReactNode } from "react";
import { groupIndex, padIndex, type ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { askAgentPrompt } from "../lib/agent-prompt.ts";
import { CopyPrompt } from "./CopyPrompt.tsx";
import { InlineMd } from "./InlineMd.tsx";

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
          <div className="mb-2 flex max-w-[42rem] items-center justify-between gap-3">
            <p className="font-mono text-[11px] tracking-wide text-muted-foreground">{props.kicker}</p>
            {props.kickerExtra}
          </div>
        ) : (
          <p className="mb-2 max-w-[42rem] font-mono text-[11px] tracking-wide text-muted-foreground">{props.kicker}</p>
        )
      ) : null}
      <h1 className="mb-3 max-w-[42rem] font-serif text-[1.85rem] font-semibold leading-[1.25] tracking-[-0.012em] text-foreground">
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
  partTitle?: string;
  onOpenGroup: (id: string) => void;
}) {
  const { group, index, groups, partTitle, onOpenGroup } = props;
  return (
    <Brief
      kicker={partTitle !== undefined ? `${partTitle} · ${padIndex(index)}` : padIndex(index)}
      title={group.title}
      kickerExtra={<CopyPrompt prompt={askAgentPrompt({ group: group.id })} scope="group" />}
    >
      <p className="mb-2 max-w-[42rem] font-mono text-[11px] tracking-wide text-muted-foreground">Why</p>
      <p className="mb-6 max-w-[42rem] font-serif text-lg leading-relaxed text-foreground">
        <InlineMd text={group.why} />
      </p>
      <p className="mb-2 max-w-[42rem] font-mono text-[11px] tracking-wide text-muted-foreground">What</p>
      <p className="mb-5 max-w-[42rem] leading-relaxed text-foreground">
        <InlineMd text={group.summary} />
      </p>
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
          {group.staleCount} hunk ref{group.staleCount === 1 ? "" : "s"} no longer match live git. Git wins; the pointer
          is flagged, not replaced.
        </p>
      ) : null}
    </Brief>
  );
}
