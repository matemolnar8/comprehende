import type { CSSProperties, ReactNode } from "react";
import { layerIndex, padLayer, type ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { partColor } from "../lib/parts.ts";

export function Brief(props: { kicker?: string; title: string; children?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={cn("mb-8 max-w-[68ch]", props.className)} style={props.style}>
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
  colorIndex?: number;
  partTitle?: string;
  onOpenLayer: (id: string) => void;
}) {
  const { group, index, groups, colorIndex, partTitle, onOpenLayer } = props;
  return (
    <Brief
      kicker={partTitle !== undefined ? `${partTitle} · ${padLayer(index)}` : padLayer(index)}
      title={group.title}
      className={colorIndex !== undefined ? "border-l-[3px] pl-4" : undefined}
      style={colorIndex !== undefined ? { borderLeftColor: partColor(colorIndex) } : undefined}
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
