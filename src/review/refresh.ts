import { flattenHunks, toHunkRef } from "../git/diff.ts";
import {
  formatStoredHunkRef,
  hunkKey,
  isDirHunkRef,
  isLocatedHunkRef,
  refCoversPath,
  type LocatedHunkRef,
} from "../schema/identity.ts";
import { isLockfilePath } from "../schema/lockfile.ts";
import { shortSha } from "../schema/types.ts";
import type {
  DiffFile,
  LiveHunk,
  ReviewDocument,
  ReviewGroup,
  ReviewHunkRef,
  ReviewSource,
} from "../schema/types.ts";
import { joinCoverage } from "./coverage.ts";
import { buildDigest, type DigestFile } from "./digest.ts";

export type HunkMatch = { previous: LiveHunk; next: LiveHunk };

export type HunkDelta = {
  /** Same path, same added and removed lines. The starts may differ. */
  same: HunkMatch[];
  /** Same path, overlapping old-side lines, different changed lines: the hunk was edited. */
  changed: HunkMatch[];
  /** Like changed, but the added and removed text is the same once whitespace is dropped. */
  reformat: HunkMatch[];
  added: LiveHunk[];
  removed: LiveHunk[];
};

export type GroupRefresh = {
  id: string;
  /** Refs whose hunk or file left the diff. */
  dropped: ReviewHunkRef[];
  /** Located refs rewritten to the hunk's new start. */
  moved: number;
  /** Hunks of this group that were edited since the previous review. */
  changed: LiveHunk[];
  /** Hunks of this group that only changed whitespace since the previous review. */
  reformatted: LiveHunk[];
  /** Added hunks a path ref of this group now covers. */
  newHunks: LiveHunk[];
  empty: boolean;
};

export type RefreshResult = {
  document: ReviewDocument;
  previous: ReviewSource;
  delta: HunkDelta;
  groups: GroupRefresh[];
  unchanged: string[];
  update?: { id: string; hunks: LiveHunk[] };
};

/** A hunk keeps its identity across a push or rebase when its path and its changed lines are the same. */
export function matchHunks(previous: DiffFile[], next: DiffFile[]): HunkDelta {
  const pool = new Map<string, LiveHunk[]>();
  for (const file of previous) {
    for (const hunk of flattenHunks([file])) {
      const key = contentKey(file, hunk);
      const bucket = pool.get(key);
      if (bucket === undefined) {
        pool.set(key, [hunk]);
      } else {
        bucket.push(hunk);
      }
    }
  }
  const same: HunkMatch[] = [];
  const unmatched: LiveHunk[] = [];
  for (const file of next) {
    for (const hunk of flattenHunks([file])) {
      const match = pool.get(contentKey(file, hunk))?.shift();
      if (match === undefined) {
        unmatched.push(hunk);
      } else {
        same.push({ previous: match, next: hunk });
      }
    }
  }
  const removed = [...pool.values()].flat();
  const changed: HunkMatch[] = [];
  const reformat: HunkMatch[] = [];
  const added: LiveHunk[] = [];
  for (const hunk of unmatched) {
    const at = removed.findIndex((item) => item.path === hunk.path && overlapsOldSide(item, hunk));
    if (at === -1) {
      added.push(hunk);
      continue;
    }
    const [previous] = removed.splice(at, 1);
    if (previous === undefined) {
      continue;
    }
    const match = { previous, next: hunk };
    if (squashedText(previous) === squashedText(hunk)) {
      reformat.push(match);
    } else {
      changed.push(match);
    }
  }
  return { same, changed, reformat, added, removed };
}

/** Added text and removed text with every whitespace character dropped. */
function squashedText(hunk: LiveHunk): string {
  const text = (kind: "add" | "del"): string =>
    hunk.lines
      .filter((line) => line.kind === kind)
      .map((line) => line.text.replace(/\s+/g, ""))
      .join("");
  return `${text("add")}\0${text("del")}`;
}

function overlapsOldSide(a: LiveHunk, b: LiveHunk): boolean {
  const end = (hunk: LiveHunk): number => hunk.oldStart + Math.max(hunk.oldLines, 1) - 1;
  return a.oldStart <= end(b) && b.oldStart <= end(a);
}

function contentKey(file: DiffFile, hunk: LiveHunk): string {
  const changed = hunk.lines.filter((line) => line.kind !== "ctx");
  const body =
    changed.length === 0
      ? file.headerPatch
      : changed.map((line) => `${line.kind}:${line.text}`).join("\n");
  return `${hunk.path}\0${body}`;
}

/**
 * Carry the interpretation over to the new range: re-point located refs, drop refs whose hunk
 * left the diff, and draft an update group for hunks no group covers. Prose is untouched.
 */
export function refreshDocument(
  document: ReviewDocument,
  previous: DiffFile[],
  next: DiffFile[],
  source: ReviewSource,
): RefreshResult {
  const delta = matchHunks(previous, next);
  const nextLive = flattenHunks(next);
  const nextByKey = new Map(nextLive.map((hunk) => [hunkKey(hunk), hunk]));
  const nextByPath = groupByPath(nextLive);
  const addedByPath = groupByPath(delta.added);
  const changedByPath = groupByPath(delta.changed.map((match) => match.next));
  const reformatByPath = groupByPath(delta.reformat.map((match) => match.next));
  type Carried = { next: LiveHunk; kind: "same" | "changed" | "reformat" };
  const carried = new Map<string, Carried | undefined>();
  for (const match of delta.same) {
    carried.set(hunkKey(match.previous), { next: match.next, kind: "same" });
  }
  for (const match of delta.changed) {
    carried.set(hunkKey(match.previous), { next: match.next, kind: "changed" });
  }
  for (const match of delta.reformat) {
    carried.set(hunkKey(match.previous), { next: match.next, kind: "reformat" });
  }
  for (const hunk of delta.removed) {
    carried.set(hunkKey(hunk), undefined);
  }

  const groups: GroupRefresh[] = [];
  const unchanged: string[] = [];
  const nextGroups = document.groups.map((group) => {
    const change: GroupRefresh = {
      id: group.id,
      dropped: [],
      moved: 0,
      changed: [],
      reformatted: [],
      newHunks: [],
      empty: false,
    };
    const refs: ReviewHunkRef[] = [];
    const seen = new Set<string>();
    const keep = (ref: ReviewHunkRef): void => {
      const key = isLocatedHunkRef(ref) ? hunkKey(ref) : formatStoredHunkRef(ref);
      if (!seen.has(key)) {
        seen.add(key);
        refs.push(ref);
      }
    };
    for (const ref of group.hunkRefs) {
      if (!isDirHunkRef(ref) && isLockfilePath(ref.path)) {
        keep(ref);
        continue;
      }
      if (!isLocatedHunkRef(ref)) {
        const paths = [...nextByPath.keys()].filter((path) => refCoversPath(ref, path));
        if (paths.length === 0) {
          change.dropped.push(ref);
          continue;
        }
        keep(ref);
        for (const path of paths) {
          change.changed.push(...(changedByPath.get(path) ?? []));
          change.reformatted.push(...(reformatByPath.get(path) ?? []));
          change.newHunks.push(...(addedByPath.get(path) ?? []));
        }
        continue;
      }
      const key = hunkKey(ref);
      if (carried.has(key)) {
        const to = carried.get(key);
        if (to === undefined) {
          change.dropped.push(ref);
          continue;
        }
        const moved = locatedRef(to.next);
        if (hunkKey(moved) !== key) {
          change.moved += 1;
        }
        if (to.kind === "changed") {
          change.changed.push(to.next);
        } else if (to.kind === "reformat") {
          change.reformatted.push(to.next);
        }
        keep(moved);
        continue;
      }
      if (nextByKey.has(key)) {
        keep(ref);
      } else {
        change.dropped.push(ref);
      }
    }
    change.empty = refs.length === 0;
    if (
      change.dropped.length > 0 ||
      change.moved > 0 ||
      change.changed.length > 0 ||
      change.reformatted.length > 0 ||
      change.newHunks.length > 0
    ) {
      groups.push(change);
    } else {
      unchanged.push(group.id);
    }
    return { ...group, hunkRefs: refs };
  });

  const refreshed: ReviewDocument = { ...document, source, groups: nextGroups };
  const uncovered = joinCoverage(refreshed, nextLive).unassigned;
  if (uncovered.length === 0) {
    return { document: refreshed, previous: document.source, delta, groups, unchanged };
  }
  const update = updateGroup(document, uncovered, nextByPath);
  return {
    document: { ...refreshed, groups: [...nextGroups, update] },
    previous: document.source,
    delta,
    groups,
    unchanged,
    update: { id: update.id, hunks: uncovered },
  };
}

function updateGroup(
  document: ReviewDocument,
  uncovered: LiveHunk[],
  nextByPath: Map<string, LiveHunk[]>,
): ReviewGroup {
  const ids = new Set(document.groups.map((group) => group.id));
  let id = "update";
  for (let n = 2; ids.has(id); n += 1) {
    id = `update-${n}`;
  }
  const refs: ReviewHunkRef[] = [];
  const seen = new Set<string>();
  for (const hunk of uncovered) {
    const atPath = nextByPath.get(hunk.path) ?? [];
    const ref: ReviewHunkRef =
      atPath.length <= 1 && hunk.oldPath === undefined ? { path: hunk.path } : locatedRef(hunk);
    const key = formatStoredHunkRef(ref);
    if (!seen.has(key)) {
      seen.add(key);
      refs.push(ref);
    }
  }
  const since = document.source.headSha;
  return {
    id,
    title: "Update",
    why: `Draft: hunks new since ${since === undefined ? "the last review" : shortSha(since)}. Move each into its group, or give it a group.`,
    summary: "Fill this group.",
    suggestedOrder: Math.max(-1, ...document.groups.map((group) => group.suggestedOrder)) + 1,
    hunkRefs: refs,
  };
}

function locatedRef(hunk: LiveHunk): LocatedHunkRef {
  const ref: LocatedHunkRef = {
    path: hunk.path,
    oldStart: hunk.oldStart,
    newStart: hunk.newStart,
  };
  if (hunk.oldPath !== undefined) {
    ref.oldPath = hunk.oldPath;
  }
  return ref;
}

function groupByPath(hunks: LiveHunk[]): Map<string, LiveHunk[]> {
  const byPath = new Map<string, LiveHunk[]>();
  for (const hunk of hunks) {
    const bucket = byPath.get(hunk.path);
    if (bucket === undefined) {
      byPath.set(hunk.path, [hunk]);
    } else {
      bucket.push(hunk);
    }
  }
  return byPath;
}

export type RefreshContext = {
  /** Subjects of commits in the new head that the previous head did not have. */
  commits: string[];
  /** Source ids whose comment pin no longer sits on a live line. */
  stalePins: string[];
};

/** One line per file that changed since the previous review. Same shape as the digest. */
export function formatRefresh(
  result: RefreshResult,
  next: DiffFile[],
  context: RefreshContext,
): string {
  const { previous, document, delta } = result;
  const source = document.source;
  const range = source.range ?? `${source.baseRef}...${source.headRef}`;
  const head = `head ${pair(previous.headSha, source.headSha)}`;
  const base =
    previous.baseSha === source.baseSha
      ? "base unchanged"
      : `base ${pair(previous.baseSha, source.baseSha)}`;
  const lines = [`# Refresh ${range} — ${head} · ${base}`];

  const previousPaths = new Set([
    ...delta.same.map((match) => match.previous.path),
    ...delta.changed.map((match) => match.previous.path),
    ...delta.reformat.map((match) => match.previous.path),
    ...delta.removed.map((hunk) => hunk.path),
  ]);
  const addedByPath = groupByPath(delta.added);
  const changedByPath = groupByPath(
    [...delta.changed, ...delta.reformat].map((match) => match.next),
  );
  const removedByPath = groupByPath(delta.removed);
  const digests = buildDigest(next).files;
  const gone = [...removedByPath.keys()].filter(
    (path) => !digests.some((file) => file.path === path),
  );
  const changed = digests.filter(
    (file) =>
      addedByPath.has(file.path) || changedByPath.has(file.path) || removedByPath.has(file.path),
  );
  const fresh = changed.filter((file) => !previousPaths.has(file.path));
  const edited = changed.length - fresh.length;
  const same = digests.length - changed.length;
  lines.push(
    `# ${count(edited, "file")} changed · ${fresh.length} new · ${gone.length} gone · ${same} same`,
  );

  if (context.commits.length > 0) {
    lines.push(`Commits since ${shortSha(previous.headSha ?? "")}:`);
    lines.push(...context.commits.map((subject) => `- ${subject}`));
  }

  const coverage = joinCoverage(document, flattenHunks(next));
  const groupsAt = (path: string): string[] =>
    coverage.groups
      .filter((group) => group.hunks.some((hunk) => hunk.path === path))
      .map((group) => group.group.id);
  const sameKeys = new Set(delta.same.map((match) => hunkKey(match.next)));
  const changedKeys = new Set(delta.changed.map((match) => hunkKey(match.next)));
  const reformatKeys = new Set(delta.reformat.map((match) => hunkKey(match.next)));
  const tag = (key: string): string =>
    sameKeys.has(key)
      ? "same"
      : changedKeys.has(key)
        ? "changed"
        : reformatKeys.has(key)
          ? "reformat"
          : "new";
  const wasIn = (path: string): string[] =>
    result.groups
      .filter((group) =>
        group.dropped.some((ref) =>
          isDirHunkRef(ref) ? refCoversPath(ref, path) : ref.path === path,
        ),
      )
      .map((group) => group.id);

  if (changed.length > 0 || gone.length > 0) {
    lines.push("Files:");
  }
  for (const file of changed) {
    const isNew = !previousPaths.has(file.path);
    const bits = [`- ${file.path}`, `${file.status} +${file.added}/-${file.removed}`, file.kind];
    if (file.oldPath !== undefined) {
      bits.push(`was ${file.oldPath}`);
    }
    if (isNew) {
      bits.push("new");
    } else {
      bits.push(
        `hunks: ${file.hunks.map((hunk) => `${hunk.ref} ${tag(digestKey(file, hunk))}`).join(", ")}`,
      );
      const removed = removedByPath.get(file.path) ?? [];
      if (removed.length > 0) {
        bits.push(
          `gone: ${removed.map((hunk) => formatStoredHunkRef(toHunkRef(hunk))).join(", ")}`,
        );
      }
    }
    const symbols = [
      ...new Set(
        file.hunks
          .filter((hunk) => !sameKeys.has(digestKey(file, hunk)))
          .flatMap((hunk) => hunk.symbols),
      ),
    ];
    if (symbols.length > 0) {
      bits.push(`symbols: ${symbols.join(", ")}`);
    }
    const groups = groupsAt(file.path);
    if (groups.length > 0) {
      bits.push(`in ${groups.join(", ")}`);
    }
    lines.push(bits.join(" · "));
  }
  for (const path of gone) {
    const bits = [`- ${path}`, "gone"];
    const groups = wasIn(path);
    if (groups.length > 0) {
      bits.push(`was in ${groups.join(", ")}`);
    }
    lines.push(bits.join(" · "));
  }

  lines.push("Groups:");
  for (const group of result.groups) {
    const bits: string[] = [];
    if (group.changed.length > 0) {
      bits.push(`${count(group.changed.length, "hunk")} changed`);
    }
    if (group.reformatted.length > 0) {
      bits.push(`${count(group.reformatted.length, "hunk")} reformatted`);
    }
    if (group.newHunks.length > 0) {
      bits.push(count(group.newHunks.length, "new hunk"));
    }
    if (group.dropped.length > 0) {
      bits.push(`${count(group.dropped.length, "ref")} gone`);
    }
    if (group.moved > 0) {
      bits.push(`${count(group.moved, "ref")} re-pointed`);
    }
    if (group.empty) {
      bits.push("now empty");
    }
    lines.push(`- ${group.id}: ${bits.join(" · ")}`);
  }
  if (result.update !== undefined) {
    lines.push(
      `- ${result.update.id}: draft · ${count(result.update.hunks.length, "uncovered hunk")}`,
    );
  }
  if (result.unchanged.length > 0) {
    lines.push(`- same: ${result.unchanged.join(", ")}`);
  }
  if (context.stalePins.length > 0) {
    lines.push(`Pins off a live line: ${context.stalePins.join(", ")}`);
  }
  return lines.join("\n");
}

function digestKey(file: DigestFile, hunk: DigestFile["hunks"][number]): string {
  return hunkKey({
    path: file.path,
    oldPath: file.oldPath,
    oldStart: hunk.oldStart,
    newStart: hunk.newStart,
  });
}

function pair(from: string | undefined, to: string | undefined): string {
  return `${shortSha(from ?? "?")} -> ${shortSha(to ?? "?")}`;
}

function count(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? "" : "s"}`;
}
