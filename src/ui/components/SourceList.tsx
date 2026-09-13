import type { Source } from "../../schema/types.ts";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";
import { partColor, type Part } from "../lib/parts.ts";
import { useSources } from "../lib/sources-context.tsx";
import { Kicker } from "./Kicker.tsx";

export function SourceList(props: {
  ids: readonly string[];
  sources: readonly Source[];
  mixed?: boolean;
  parts?: Part[];
  className?: string;
}) {
  const { ids, sources, mixed = false, parts = [], className } = props;
  const onOpenSource = useSources()?.onOpenSource;
  if (ids.length === 0) {
    return null;
  }
  const byId = new Map(sources.map((source) => [source.id, source]));
  const rows = ids.flatMap((id) => {
    const source = byId.get(id);
    return source === undefined ? [] : [source];
  });
  if (rows.length === 0) {
    return null;
  }
  return (
    <section className={cn("mb-5", className)} aria-label="Sources">
      <Kicker className="mb-2">Sources</Kicker>
      <ul className="m-0 list-none divide-y divide-border border-y border-border p-0 font-mono text-[11px] tracking-wide text-muted-foreground">
        {rows.map((source) => {
          const strand = mixed ? parts.find((part) => part.title === source.part) : undefined;
          const labelClass = "shrink-0 text-foreground";
          const detail = source.gist ?? source.title;
          const canJump = onOpenSource !== undefined && (source.url === undefined || detail !== undefined);
          return (
            <li key={source.id} className="flex min-w-0 items-baseline gap-2 py-1.5">
              {strand !== undefined ? (
                <span
                  aria-hidden
                  className="mt-[0.3em] size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: partColor(strand.colorIndex) }}
                />
              ) : null}
              {source.url !== undefined ? (
                <a
                  className={cn(labelClass, "hover:text-primary hover:underline")}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.label}
                </a>
              ) : canJump ? null : (
                <span className={labelClass}>{source.label}</span>
              )}
              {canJump ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto min-w-0 flex-1 items-baseline justify-start gap-2 p-0 font-normal whitespace-normal hover:bg-transparent"
                  onClick={() => onOpenSource?.(source)}
                  aria-label={`Open ${source.label} in the review`}
                >
                  {source.url === undefined ? <span className={labelClass}>{source.label}</span> : null}
                  {detail !== undefined ? (
                    <span className="min-w-0 truncate font-sans text-xs font-normal tracking-normal text-muted-foreground">
                      {detail}
                    </span>
                  ) : null}
                </Button>
              ) : detail !== undefined ? (
                <span className="min-w-0 truncate font-sans text-xs tracking-normal">{detail}</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
