import type { HunkDelta } from "../review/refresh.ts";
import { hunkKey, isDirHunkRef, refCoversPath } from "../schema/identity.ts";
import type { LiveHunk, ReviewDocument, ReviewGroup } from "../schema/types.ts";
import type {
  ApiChanges,
  ApiGroupChange,
  ApiHunkCounts,
  ApiListChange,
  ApiTextChange,
  ApiTextChanges,
} from "./types.ts";

export type CodeChanges = {
  delta: HunkDelta;
  /** Live hunks of each current group. */
  groups: ReadonlyMap<string, readonly LiveHunk[]>;
};

/** Compare a review with the one it was refreshed from. Groups match by id. */
export function changesPayload(
  previous: ReviewDocument,
  current: ReviewDocument,
  code: CodeChanges | undefined,
): ApiChanges {
  const count = code === undefined ? undefined : hunkCounter(code.delta);
  const delta = code?.delta;
  const matched = delta === undefined ? [] : [...delta.same, ...delta.changed, ...delta.reformat];
  const pathsBefore = (group: ReviewGroup) =>
    groupPaths(group, previous, delta && [...matched.map((m) => m.previous), ...delta.removed]);
  const pathsAfter = (group: ReviewGroup) =>
    groupPaths(group, current, delta && [...matched.map((m) => m.next), ...delta.added]);
  const before = new Map(previous.groups.map((group) => [group.id, group]));
  const after = new Set(current.groups.map((group) => group.id));
  const groups: ApiGroupChange[] = [];
  for (const group of readingOrder(current.groups)) {
    const old = before.get(group.id);
    const hunks = count?.(code?.groups.get(group.id) ?? []);
    const change: ApiGroupChange = {
      id: group.id,
      state: old === undefined ? "added" : "kept",
      title: group.title,
      text: old === undefined ? {} : groupText(old, group),
      lookFor: old === undefined ? noList() : listChange(old.lookFor, group.lookFor),
      files: old === undefined ? noList() : listChange(pathsBefore(old), pathsAfter(group)),
      ...(hunks === undefined ? {} : { hunks }),
    };
    if (change.state === "added" || hasChange(change)) {
      groups.push(change);
    }
  }
  for (const group of readingOrder(previous.groups)) {
    if (!after.has(group.id)) {
      groups.push({
        id: group.id,
        state: "removed",
        title: group.title,
        text: {},
        lookFor: noList(),
        files: noList(),
      });
    }
  }
  const sourceLabel = (document: ReviewDocument) =>
    new Map((document.sources ?? []).map((source) => [source.id, source.label]));
  const previousSources = sourceLabel(previous);
  const currentSources = sourceLabel(current);
  return {
    since: { baseSha: previous.source.baseSha, headSha: previous.source.headSha },
    text: textChanges({
      title: textChange(previous.title, current.title),
      summary: textChange(previous.summary, current.summary),
      why: textChange(previous.why, current.why),
    }),
    lookFor: listChange(previous.lookFor, current.lookFor),
    sources: {
      added: [...currentSources]
        .filter(([id]) => !previousSources.has(id))
        .map(([, label]) => label),
      removed: [...previousSources]
        .filter(([id]) => !currentSources.has(id))
        .map(([, label]) => label),
    },
    groups,
    ...(code === undefined
      ? {}
      : {
          hunks: {
            new: code.delta.added.length,
            changed: code.delta.changed.length,
            reformat: code.delta.reformat.length,
            gone: code.delta.removed.length,
          },
        }),
  };
}

function hunkCounter(delta: HunkDelta): (hunks: readonly LiveHunk[]) => ApiHunkCounts {
  const keys = (hunks: readonly LiveHunk[]) => new Set(hunks.map((hunk) => hunkKey(hunk)));
  const added = keys(delta.added);
  const changed = keys(delta.changed.map((match) => match.next));
  const reformat = keys(delta.reformat.map((match) => match.next));
  return (hunks) => {
    const unique = new Set(hunks.map((hunk) => hunkKey(hunk)));
    const tally = (pool: Set<string>) => [...unique].filter((key) => pool.has(key)).length;
    return { new: tally(added), changed: tally(changed), reformat: tally(reformat) };
  };
}

function groupText(before: ReviewGroup, after: ReviewGroup): ApiTextChanges {
  return textChanges({
    title: textChange(before.title, after.title),
    summary: textChange(before.summary, after.summary),
    why: textChange(before.why, after.why),
  });
}

function textChanges(changes: Record<keyof ApiTextChanges, ApiTextChange | undefined>) {
  const text: ApiTextChanges = {};
  for (const key of ["title", "summary", "why"] as const) {
    const change = changes[key];
    if (change !== undefined) {
      text[key] = change;
    }
  }
  return text;
}

function textChange(
  before: string | undefined,
  after: string | undefined,
): ApiTextChange | undefined {
  const from = before ?? "";
  const to = after ?? "";
  return from === to ? undefined : { before: from, after: to };
}

function listChange(before: readonly string[] = [], after: readonly string[] = []): ApiListChange {
  const had = new Set(before);
  const has = new Set(after);
  return {
    added: [...has].filter((item) => !had.has(item)),
    removed: [...had].filter((item) => !has.has(item)),
  };
}

function noList(): ApiListChange {
  return { added: [], removed: [] };
}

/** A directory ref lists the live paths it holds: under it and named by no path or hunk ref. */
function groupPaths(
  group: ReviewGroup,
  document: ReviewDocument,
  live: readonly LiveHunk[] | undefined,
): string[] {
  const named = new Set(
    document.groups.flatMap((item) =>
      item.hunkRefs.flatMap((ref) => (isDirHunkRef(ref) ? [] : [ref.path])),
    ),
  );
  const paths = [...new Set(live?.map((hunk) => hunk.path))];
  return [
    ...new Set(
      group.hunkRefs.flatMap((ref) => {
        if (!isDirHunkRef(ref)) {
          return [ref.path];
        }
        return live === undefined
          ? [ref.dir]
          : paths.filter((path) => refCoversPath(ref, path) && !named.has(path));
      }),
    ),
  ];
}

function hasChange(change: ApiGroupChange): boolean {
  const hunks = change.hunks;
  return (
    Object.keys(change.text).length > 0 ||
    change.lookFor.added.length + change.lookFor.removed.length > 0 ||
    change.files.added.length + change.files.removed.length > 0 ||
    (hunks !== undefined && hunks.new + hunks.changed + hunks.reformat > 0)
  );
}

function readingOrder(groups: readonly ReviewGroup[]): ReviewGroup[] {
  return groups
    .slice()
    .sort((a, b) => a.suggestedOrder - b.suggestedOrder || a.id.localeCompare(b.id));
}
