import { useMemo, type ReactNode } from "react";
import {
  listDiffHasChanges,
  type ChangedGroup,
  type ComparePayload,
  type GroupSide,
  type ListDiff,
  type TextChange,
} from "../../review/compare.ts";
import { formatHunkRef } from "../../schema/identity.ts";
import { sizeLabel } from "../../schema/types.ts";
import type { Source } from "../../schema/types.ts";
import { SourcesProvider, type SourcesHandle } from "../lib/sources-context.tsx";
import { Brief } from "./GroupBrief.tsx";
import { InlineMd } from "./InlineMd.tsx";
import { Kicker } from "./Kicker.tsx";
import { LookForList } from "./LookForList.tsx";
import { SourceList } from "./SourceList.tsx";
import type { CompareSelection } from "./CompareNav.tsx";

const MATCH_REASON: Record<ChangedGroup["reason"], string> = {
  id: "Matched by id",
  title: "Matched by title",
  hunks: "Matched by hunks",
};

export function CompareStage(props: { payload: ComparePayload; selection: CompareSelection }) {
  const { payload, selection } = props;
  const { comparison } = payload;
  return (
    <main className="h-full overflow-auto px-10 py-8 max-sm:px-4 max-sm:py-4">
      {selection.kind === "overview" ? (
        <Overview payload={payload} />
      ) : selection.kind === "added" ? (
        <AddedGroup group={comparison.groups.added.find((item) => item.id === selection.id)} sources={payload.to.sources} />
      ) : selection.kind === "removed" ? (
        <RemovedGroup
          group={comparison.groups.removed.find((item) => item.id === selection.id)}
          sources={payload.from.sources}
        />
      ) : (
        <ChangedGroupView
          group={comparison.groups.changed.find(
            (item) => item.from.id === selection.fromId && item.to.id === selection.toId,
          )}
          fromSources={payload.from.sources}
          toSources={payload.to.sources}
        />
      )}
    </main>
  );
}

function Overview(props: { payload: ComparePayload }) {
  const { payload } = props;
  const { comparison } = payload;
  const { added, removed, changed, unchangedCount } = comparison.groups;
  const counts = [
    changed.length > 0 ? `${changed.length} changed` : null,
    added.length > 0 ? `${added.length} added` : null,
    removed.length > 0 ? `${removed.length} removed` : null,
    unchangedCount > 0 ? `${unchangedCount} unchanged` : null,
  ].filter((item) => item !== null);
  const kicker =
    comparison.identical || counts.length === 0 ? sizeLabel(payload.to.size) : counts.join(" · ");
  return (
    <Brief kicker={kicker} title={payload.to.title}>
      {comparison.identical ? (
        <p className="leading-relaxed text-foreground">The interpretation did not change.</p>
      ) : (
        <>
          <FieldChange label="Title" change={comparison.document.title} fromSources={payload.from.sources} toSources={payload.to.sources} />
          <FieldChange label="Why" change={comparison.document.why} fromSources={payload.from.sources} toSources={payload.to.sources} />
          <FieldChange label="What" change={comparison.document.summary} fromSources={payload.from.sources} toSources={payload.to.sources} />
          {comparison.document.size !== undefined ? (
            <PlainChange
              label="Size"
              from={sizeLabel(comparison.document.size.from)}
              to={sizeLabel(comparison.document.size.to)}
            />
          ) : null}
          {comparison.document.range !== undefined ? (
            <PlainChange label="Range" from={comparison.document.range.from} to={comparison.document.range.to} />
          ) : null}
          <BulletDiff label="Look for" diff={comparison.document.lookFor} fromSources={payload.from.sources} toSources={payload.to.sources} />
          <SourceDiff
            added={comparison.document.sources.added}
            removed={comparison.document.sources.removed}
            changed={comparison.document.sources.changed}
          />
        </>
      )}
    </Brief>
  );
}

function AddedGroup(props: { group: GroupSide | undefined; sources: Source[] }) {
  if (props.group === undefined) {
    return null;
  }
  return (
    <CiteScope sources={props.sources}>
      <Brief kicker="Added" title={props.group.title}>
        <GroupBody group={props.group} sources={props.sources} />
      </Brief>
    </CiteScope>
  );
}

function RemovedGroup(props: { group: GroupSide | undefined; sources: Source[] }) {
  if (props.group === undefined) {
    return null;
  }
  return (
    <CiteScope sources={props.sources}>
      <Brief kicker="Removed" title={props.group.title}>
        <GroupBody group={props.group} sources={props.sources} />
      </Brief>
    </CiteScope>
  );
}

function GroupBody(props: { group: GroupSide; sources: Source[] }) {
  return (
    <>
      <Kicker className="mb-2">Why</Kicker>
      <p className="mb-4 font-display text-base leading-relaxed text-pretty text-foreground min-[800px]:mb-6 min-[800px]:text-xl">
        <InlineMd text={props.group.why} />
      </p>
      <Kicker className="mb-2">What</Kicker>
      <p className="mb-4 leading-relaxed text-pretty text-foreground min-[800px]:mb-5">
        <InlineMd text={props.group.summary} />
      </p>
      <SourceList ids={props.group.sources} sources={props.sources} />
      <LookForList items={props.group.lookFor} />
      {props.group.hunkRefs.length > 0 ? (
        <HunkList refs={props.group.hunkRefs.map((ref) => formatHunkRef(ref))} />
      ) : null}
    </>
  );
}

function ChangedGroupView(props: {
  group: ChangedGroup | undefined;
  fromSources: Source[];
  toSources: Source[];
}) {
  const group = props.group;
  if (group === undefined) {
    return null;
  }
  const tags = [group.retitled ? "Retitled" : null, group.regrouped ? "Regrouped" : null].filter((item) => item !== null);
  return (
    <Brief kicker={tags.length > 0 ? tags.join(" · ") : "Changed"} title={group.to.title}>
      <p className="mb-5 font-mono text-xs text-muted-foreground">
        {MATCH_REASON[group.reason]}
        {group.from.id !== group.to.id || group.from.title !== group.to.title
          ? ` · from ${group.from.title} (${group.from.id})`
          : null}
      </p>
      <FieldChange label="Title" change={group.title} fromSources={props.fromSources} toSources={props.toSources} />
      <FieldChange label="Why" change={group.why} fromSources={props.fromSources} toSources={props.toSources} />
      <FieldChange label="What" change={group.summary} fromSources={props.fromSources} toSources={props.toSources} />
      <FieldChange label="Part" change={group.part} fromSources={props.fromSources} toSources={props.toSources} />
      {group.suggestedOrder !== undefined ? (
        <PlainChange label="Order" from={String(group.suggestedOrder.from)} to={String(group.suggestedOrder.to)} />
      ) : null}
      <BulletDiff label="Look for" diff={group.lookFor} fromSources={props.fromSources} toSources={props.toSources} />
      <BulletDiff label="Sources" diff={group.sources} fromSources={props.fromSources} toSources={props.toSources} />
      <BulletDiff label="Depends on" diff={group.dependsOn} fromSources={props.fromSources} toSources={props.toSources} />
      {group.regrouped ? (
        <div className="mb-5">
          <Kicker className="mb-2">Hunks</Kicker>
          <ul className="space-y-1 font-mono text-[11px] leading-relaxed">
            {group.hunks.removed.map((ref) => (
              <li key={`-${formatHunkRef(ref)}`} className="text-del">
                - {formatHunkRef(ref)}
              </li>
            ))}
            {group.hunks.added.map((ref) => (
              <li key={`+${formatHunkRef(ref)}`} className="text-add">
                + {formatHunkRef(ref)}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </Brief>
  );
}

function FieldChange(props: {
  label: string;
  change: TextChange | { from: string; to: string } | undefined;
  fromSources: Source[];
  toSources: Source[];
}) {
  if (props.change === undefined) {
    return null;
  }
  return (
    <div className="mb-5">
      <Kicker className="mb-2">{props.label}</Kicker>
      {props.change.from !== undefined ? (
        <CiteScope sources={props.fromSources}>
          <p className="mb-2 border-l-2 border-del pl-3 leading-relaxed text-pretty text-del">
            <InlineMd text={props.change.from} />
          </p>
        </CiteScope>
      ) : null}
      {props.change.to !== undefined ? (
        <CiteScope sources={props.toSources}>
          <p className="border-l-2 border-add pl-3 leading-relaxed text-pretty text-add">
            <InlineMd text={props.change.to} />
          </p>
        </CiteScope>
      ) : null}
    </div>
  );
}

function PlainChange(props: { label: string; from: string; to: string }) {
  return (
    <div className="mb-5">
      <Kicker className="mb-2">{props.label}</Kicker>
      <p className="mb-2 border-l-2 border-del pl-3 font-mono text-sm text-del">{props.from}</p>
      <p className="border-l-2 border-add pl-3 font-mono text-sm text-add">{props.to}</p>
    </div>
  );
}

function BulletDiff(props: { label: string; diff: ListDiff; fromSources: Source[]; toSources: Source[] }) {
  if (!listDiffHasChanges(props.diff)) {
    return null;
  }
  return (
    <div className="mb-5">
      <Kicker className="mb-2">{props.label}</Kicker>
      <ul className="list-none space-y-2 pl-0 leading-relaxed">
        {props.diff.removed.map((item) => (
          <li key={`-${item}`} className="border-l-2 border-del pl-3 text-del">
            <CiteScope sources={props.fromSources}>
              <span className="mr-2 font-mono text-[11px]">-</span>
              <InlineMd text={item} />
            </CiteScope>
          </li>
        ))}
        {props.diff.added.map((item) => (
          <li key={`+${item}`} className="border-l-2 border-add pl-3 text-add">
            <CiteScope sources={props.toSources}>
              <span className="mr-2 font-mono text-[11px]">+</span>
              <InlineMd text={item} />
            </CiteScope>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SourceDiff(props: { added: Source[]; removed: Source[]; changed: { from: Source; to: Source }[] }) {
  if (props.added.length + props.removed.length + props.changed.length === 0) {
    return null;
  }
  return (
    <div className="mb-5">
      <Kicker className="mb-2">Sources</Kicker>
      <ul className="space-y-2 font-mono text-[11px] tracking-wide">
        {props.removed.map((source) => (
          <li key={`-${source.id}`} className="text-del">
            - {source.label} ({source.id})
          </li>
        ))}
        {props.added.map((source) => (
          <li key={`+${source.id}`} className="text-add">
            + {source.label} ({source.id})
          </li>
        ))}
        {props.changed.map((change) => (
          <li key={`${change.from.id}:${change.to.id}`} className="text-foreground">
            {change.to.label} ({change.to.id}
            {change.from.id !== change.to.id ? `, from ${change.from.id}` : ""})
            {change.from.gist !== change.to.gist && change.to.gist !== undefined ? (
              <span className="mt-1 block font-sans text-xs tracking-normal text-muted-foreground">{change.to.gist}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HunkList(props: { refs: string[] }) {
  return (
    <ul className="mt-4 space-y-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
      {props.refs.map((ref) => (
        <li key={ref}>{ref}</li>
      ))}
    </ul>
  );
}

function CiteScope(props: { sources: readonly Source[]; children: ReactNode }) {
  const value = useMemo<SourcesHandle>(
    () => ({
      byId: new Map(props.sources.map((source) => [source.id, source])),
      staleIds: new Set(),
      onCite: () => {},
    }),
    [props.sources],
  );
  return <SourcesProvider value={value}>{props.children}</SourcesProvider>;
}
