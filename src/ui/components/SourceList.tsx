import { ArrowUpRightIcon } from "lucide-react";
import type { Source } from "../../schema/types.ts";
import { cn } from "@/lib/utils.ts";
import { partColor, type Part } from "../lib/parts.ts";
import { Kicker } from "./Kicker.tsx";

export function SourceList(props: {
  ids: readonly string[];
  sources: readonly Source[];
  mixed?: boolean;
  parts?: Part[];
  className?: string;
}) {
  const { ids, sources, mixed = false, parts = [], className } = props;
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
    <div className={cn("mb-5", className)}>
      <Kicker className="mb-2">Sources</Kicker>
      <ul className="space-y-1 font-mono text-[11px] tracking-wide text-muted-foreground">
        {rows.map((source) => {
          const strand = mixed ? parts.find((part) => part.title === source.part) : undefined;
          return (
            <li key={source.id} className="flex min-w-0 items-baseline gap-2">
              {strand !== undefined ? (
                <span
                  aria-hidden
                  className="mt-[0.3em] size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: partColor(strand.colorIndex) }}
                />
              ) : null}
              <span className="shrink-0 text-foreground">{source.label}</span>
              {source.gist !== undefined ? (
                <span className="min-w-0 truncate font-sans text-xs tracking-normal">{source.gist}</span>
              ) : source.title !== undefined ? (
                <span className="min-w-0 truncate font-sans text-xs tracking-normal">{source.title}</span>
              ) : null}
              {source.url !== undefined ? (
                <a
                  className="ml-auto shrink-0 text-primary hover:text-primary/80"
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open ${source.label}`}
                >
                  <ArrowUpRightIcon className="size-3.5" />
                </a>
              ) : (
                <span className="ml-auto" />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
