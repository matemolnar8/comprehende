import type { ReactNode } from "react";
import { groupIndex, padIndex, type ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { CopyPrompt } from "./CopyPrompt.tsx";
import { InlineMd } from "./InlineMd.tsx";

export function Brief(props: {
  kicker?: string;
  title: string;
  children?: ReactNode;
  className?: string;
  kickerExtra?: ReactNode;
  titleExtra?: ReactNode;
  strip?: ReactNode;
}) {
  return (
    <div className={props.className}>
      {props.kicker !== undefined ? (
        props.kickerExtra !== undefined ? (
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] tracking-wide text-muted-foreground">{props.kicker}</p>
            {props.kickerExtra}
          </div>
        ) : (
          <p className="mb-2 font-mono text-[11px] tracking-wide text-muted-foreground">{props.kicker}</p>
        )
      ) : null}
      {props.titleExtra !== undefined ? (
        <div className="mb-3 flex items-start justify-between gap-3">
          <h1 className="min-w-0 flex-1 font-serif text-[1.75rem] leading-snug text-foreground">{props.title}</h1>
          {props.titleExtra}
        </div>
      ) : (
        <h1 className="mb-3 font-serif text-[1.75rem] leading-snug text-foreground">{props.title}</h1>
      )}
      {props.strip}
      {props.children}
    </div>
  );
}

export function GroupBrief(props: {
  group: ReviewMeta["groups"][number];
  index: number;
  groups: ReviewMeta["groups"];
  partTitle?: string;
  prompt: string | null;
  onOpenGroup: (id: string) => void;
}) {
  const { group, index, groups, partTitle, prompt, onOpenGroup } = props;
  const copy =
    prompt === null
      ? {}
      : {
          kickerExtra: <CopyPrompt prompt={prompt} slot="kicker" scope="group" />,
          titleExtra: <CopyPrompt prompt={prompt} slot="title" scope="group" />,
          strip: <CopyPrompt prompt={prompt} slot="strip" scope="group" />,
        };
  return (
    <Brief
      kicker={partTitle !== undefined ? `${partTitle} · ${padIndex(index)}` : padIndex(index)}
      title={group.title}
      {...copy}
    >
      <p className="mb-2 font-mono text-[11px] tracking-wide text-muted-foreground">Why</p>
      <p className="mb-6 font-serif text-lg leading-relaxed text-foreground">
        <InlineMd text={group.why} />
      </p>
      <p className="mb-2 font-mono text-[11px] tracking-wide text-muted-foreground">What</p>
      <p className="mb-5 leading-relaxed text-foreground">
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
      {prompt !== null ? <CopyPrompt prompt={prompt} slot="after" scope="group" /> : null}
      {group.staleCount > 0 ? (
        <p className="mt-4 text-warn">
          {group.staleCount} hunk ref{group.staleCount === 1 ? "" : "s"} no longer match live git. Git wins; the pointer
          is flagged, not replaced.
        </p>
      ) : null}
    </Brief>
  );
}
