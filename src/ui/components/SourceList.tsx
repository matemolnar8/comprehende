import type { Source } from "../../schema/types.ts";
import { cn } from "@/lib/utils.ts";
import { partColor, type Part } from "../lib/parts.ts";
import { SOURCE_KIND_ICON, SOURCE_KIND_LABEL } from "../lib/source-display.ts";
import { useSources } from "../lib/sources-context.tsx";
import { HashLink, hashLinkText } from "./HashLink.tsx";
import { BriefField, briefRows } from "./Kicker.tsx";

export function SourceList(props: {
  ids: readonly string[];
  sources: readonly Source[];
  mixed?: boolean;
  parts?: Part[];
  className?: string;
}) {
  const { ids, sources, mixed = false, parts = [], className } = props;
  const handle = useSources();
  const onOpenSource = handle?.onOpenSource;
  const selectionForSource = handle?.selectionForSource;
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
    <BriefField kicker="Sources" className={className}>
      <ul className={briefRows}>
        {rows.map((source) => {
          const strand = mixed ? parts.find((part) => part.title === source.part) : undefined;
          const detail = source.gist ?? source.title;
          const jump =
            onOpenSource !== undefined &&
            selectionForSource !== undefined &&
            (source.url === undefined || detail !== undefined);
          const KindIcon = SOURCE_KIND_ICON[source.kind];
          return (
            <li key={source.id} className="flex min-w-0 items-baseline gap-2 py-1 leading-[1.45]">
              {strand !== undefined ? (
                <span
                  aria-hidden
                  className="mt-[0.3em] size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: partColor(strand.colorIndex) }}
                />
              ) : null}
              <span className="inline-flex w-[7.75rem] shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                <KindIcon aria-hidden className="size-3.5 shrink-0" />
                {SOURCE_KIND_LABEL[source.kind]}
              </span>
              {source.url !== undefined ? (
                <a
                  className={cn("max-w-[40%] shrink-0 truncate text-foreground", hashLinkText)}
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.label}
                </a>
              ) : jump ? null : (
                <span className="max-w-[40%] shrink-0 truncate text-foreground">{source.label}</span>
              )}
              {jump ? (
                <HashLink
                  selection={selectionForSource(source)}
                  onSelect={() => onOpenSource(source)}
                  className="flex min-w-0 flex-1 items-baseline gap-2"
                  ariaLabel={`Open ${source.label} in the review`}
                >
                  {source.url === undefined ? (
                    <span className={cn("max-w-[40%] shrink-0 truncate text-foreground", hashLinkText)}>{source.label}</span>
                  ) : null}
                  {detail !== undefined ? (
                    <span className="min-w-0 flex-1 text-pretty font-normal text-muted-foreground">{detail}</span>
                  ) : null}
                </HashLink>
              ) : detail !== undefined ? (
                <span className="min-w-0 flex-1 text-pretty text-muted-foreground">{detail}</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </BriefField>
  );
}
