import type { ReactNode } from "react";
import { layerIndex, padLayer, type ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

export function Brief(props: { kicker?: string; title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("max-w-[68ch]", props.className)}>
      {props.kicker !== undefined ? (
        <p className="mb-2 font-mono text-[11px] tracking-wide text-muted-foreground">{props.kicker}</p>
      ) : null}
      <h1 className="mb-3 font-serif text-[1.75rem] leading-snug text-foreground">{props.title}</h1>
      {props.children}
    </div>
  );
}

export function LayerBrief(props: {
  group: ReviewMeta["groups"][number];
  index: number;
  groups: ReviewMeta["groups"];
  partTitle?: string;
  onOpenLayer: (id: string) => void;
}) {
  const { group, index, groups, partTitle, onOpenLayer } = props;
  return (
    <Brief
      kicker={partTitle !== undefined ? `${partTitle} · ${padLayer(index)}` : padLayer(index)}
      title={group.title}
    >
      <p className="mb-5 font-serif text-lg leading-relaxed text-foreground">{group.summary}</p>
      {group.dependsOn.length > 0 ? (
        <p className="mb-5 text-muted-foreground">
          Depends on{" "}
          {group.dependsOn.map((id, i) => {
            const dep = groups.find((item) => item.id === id);
            const label = dep !== undefined ? `${padLayer(layerIndex(groups, id))} ${dep.title}` : id;
            return (
              <span key={id}>
                {i > 0 ? ", " : ""}
                <Button type="button" variant="link" className="h-auto p-0" onClick={() => onOpenLayer(id)}>
                  {label}
                </Button>
              </span>
            );
          })}
        </p>
      ) : null}
      {group.lookFor.length > 0 ? (
        <ul className="mb-2 list-disc space-y-2 pl-5 leading-relaxed">
          {group.lookFor.map((item) => (
            <li key={item}>{item}</li>
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
