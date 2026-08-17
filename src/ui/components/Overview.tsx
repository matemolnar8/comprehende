import type { CSSProperties } from "react";
import { padLayer, sizeLabel, type ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { isMixedReview, partColor, type Part } from "../lib/parts.ts";

export function Overview(props: {
  meta: ReviewMeta;
  parts: Part[];
  onOpenLayer: (id: string) => void;
}) {
  const { meta, parts, onOpenLayer } = props;
  const mixed = isMixedReview(parts);
  const byId = new Map(meta.groups.map((group) => [group.id, group]));

  return (
    <div className="mb-8">
      {meta.document.walkthrough !== undefined ? (
        <h1 className="mb-4 font-serif text-[1.75rem] leading-snug text-foreground">{meta.document.walkthrough}</h1>
      ) : (
        <h1 className="mb-4 font-serif text-[1.75rem] leading-snug text-foreground">Overview</h1>
      )}
      <p className="mb-10 text-muted-foreground">
        {sizeLabel(meta.document.size)} · {meta.files.length} files
      </p>
      <div
        className={
          mixed ? "grid grid-flow-col auto-cols-[minmax(16rem,1fr)] items-start gap-4 overflow-x-auto pb-1" : undefined
        }
      >
        {parts.map((part) => (
          <PartColumn
            key={part.layerIds.join("\0")}
            part={part}
            mixed={mixed}
            groups={meta.groups}
            byId={byId}
            onOpenLayer={onOpenLayer}
          />
        ))}
      </div>
      {meta.commits.length > 0 ? (
        <ul className="mt-12 space-y-2 text-sm text-muted-foreground">
          {meta.commits.map((commit) => (
            <li key={commit.sha}>
              <code className="text-primary">{commit.shortSha}</code> {commit.subject}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function PartColumn(props: {
  part: Part;
  mixed: boolean;
  groups: ReviewMeta["groups"];
  byId: Map<string, ReviewMeta["groups"][number]>;
  onOpenLayer: (id: string) => void;
}) {
  const { part, mixed, groups, byId, onOpenLayer } = props;
  const color = partColor(part.colorIndex);
  return (
    <section
      className={cn("min-w-0", mixed && "rounded-md border border-border py-2")}
      style={mixed ? partStyle(color) : undefined}
      aria-label={part.title}
    >
      {mixed && part.title !== undefined ? (
        <p className="mb-1 flex items-center gap-2 px-4 pt-2 font-mono text-[11px] tracking-wide text-muted-foreground">
          <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          {part.title}
        </p>
      ) : null}
      <ol className="m-0 list-none p-0">
        {part.layerIds.map((id) => {
          const group = byId.get(id);
          if (group === undefined) {
            return null;
          }
          const index = groups.findIndex((item) => item.id === id) + 1;
          return (
            <li key={group.id} className="mb-2 last:mb-0">
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full min-w-0 items-start justify-start gap-4 rounded-md px-4 py-4 text-left font-normal whitespace-normal"
                onClick={() => onOpenLayer(group.id)}
              >
                <span className="mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                  {padLayer(index)}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block font-medium text-foreground">{group.title}</strong>
                  <span className="mt-1 block leading-relaxed text-muted-foreground">{group.summary}</span>
                </span>
              </Button>
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
