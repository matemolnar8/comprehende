import type { Source } from "../../schema/types.ts";
import { cn } from "@/lib/utils.ts";
import { partColor, type Part } from "../lib/parts.ts";
import { SOURCE_KIND_ICON, SOURCE_KIND_LABEL } from "../lib/source-display.ts";
import { useSources } from "../lib/sources-context.tsx";
import type { Selection } from "../lib/selection.ts";
import { HashLink, hashLinkText } from "./HashLink.tsx";
import { BriefField, briefRows } from "./Kicker.tsx";

const gistText = "block text-pretty leading-[1.45] text-foreground";

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
        {rows.map((source) => (
          <SourceRow
            key={source.id}
            source={source}
            strand={mixed ? parts.find((part) => part.title === source.part) : undefined}
            onOpenSource={onOpenSource}
            selectionForSource={selectionForSource}
          />
        ))}
      </ul>
    </BriefField>
  );
}

function SourceRow(props: {
  source: Source;
  strand: Part | undefined;
  onOpenSource: ((source: Source) => void) | undefined;
  selectionForSource: ((source: Source) => Selection) | undefined;
}) {
  const { source, strand, onOpenSource, selectionForSource } = props;
  const detail = source.gist ?? source.title;
  const jump =
    onOpenSource !== undefined &&
    selectionForSource !== undefined &&
    (source.url === undefined || detail !== undefined);
  const meta = <SourceMeta source={source} strand={strand} showName={detail !== undefined} />;

  if (jump && source.url === undefined) {
    return (
      <li className="py-2">
        <HashLink
          selection={selectionForSource(source)}
          onSelect={() => onOpenSource(source)}
          className="block min-w-0"
          ariaLabel={`Open ${source.label} in the review`}
        >
          <span className={cn(gistText, hashLinkText)}>{detail ?? source.label}</span>
          {meta}
        </HashLink>
      </li>
    );
  }

  return (
    <li className="py-2">
      {detail !== undefined && jump ? (
        <HashLink
          selection={selectionForSource(source)}
          onSelect={() => onOpenSource(source)}
          className={cn(gistText, hashLinkText)}
          ariaLabel={`Open ${source.label} in the review`}
        >
          {detail}
        </HashLink>
      ) : detail !== undefined ? (
        <span className={gistText}>{detail}</span>
      ) : source.url !== undefined ? (
        <a className={cn(gistText, hashLinkText)} href={source.url} target="_blank" rel="noreferrer">
          {source.label}
        </a>
      ) : (
        <span className={gistText}>{source.label}</span>
      )}
      {meta}
    </li>
  );
}

function SourceMeta(props: { source: Source; strand: Part | undefined; showName: boolean }) {
  const { source, strand, showName } = props;
  const KindIcon = SOURCE_KIND_ICON[source.kind];
  return (
    <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs leading-[1.45] text-muted-foreground">
      {strand !== undefined ? (
        <span
          aria-hidden
          className="size-2 shrink-0 rounded-full"
          style={{ backgroundColor: partColor(strand.colorIndex) }}
        />
      ) : null}
      <KindIcon aria-hidden className="size-3.5 shrink-0" />
      <span className="shrink-0">{SOURCE_KIND_LABEL[source.kind]}</span>
      {showName ? (
        <>
          <span aria-hidden className="shrink-0">
            ·
          </span>
          {source.url !== undefined ? (
            <a className={cn("min-w-0 truncate", hashLinkText)} href={source.url} target="_blank" rel="noreferrer">
              {source.label}
            </a>
          ) : (
            <span className="min-w-0 truncate">{source.label}</span>
          )}
        </>
      ) : null}
    </span>
  );
}
