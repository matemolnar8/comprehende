import { flattenHunks, readDiff, toHunkRef } from "../git/diff.ts";
import { pinRange, type PinnedRange } from "../git/repo.ts";
import {
  formatStoredHunkRef,
  hunkKey,
  isDirHunkRef,
  isLocatedHunkRef,
  refCoversPath,
  type FileHunkRef,
  type LocatedHunkRef,
} from "../schema/identity.ts";
import { isLockfilePath } from "../schema/lockfile.ts";
import type {
  DiffFile,
  LiveHunk,
  ReviewDocument,
  ReviewGroup,
  ReviewHunkRef,
} from "../schema/types.ts";
import { buildDigest, isMechanicalKind } from "./digest.ts";

export type GroupCoverage = {
  group: ReviewGroup;
  hunks: LiveHunk[];
  /** The hunks this group holds only through a directory ref. */
  dirHunks: LiveHunk[];
  stale: ReviewHunkRef[];
};

export type ReviewCoverage = {
  groups: GroupCoverage[];
  unassigned: LiveHunk[];
  stale: ReviewHunkRef[];
  totalHunks: number;
  assignedHunks: number;
};

export async function coverReview(
  cwd: string,
  document: ReviewDocument,
  pin?: PinnedRange,
): Promise<{ files: Awaited<ReturnType<typeof readDiff>>; coverage: ReviewCoverage }> {
  const range = pin ?? (await pinRange(cwd, document.source.baseRef, document.source.headRef));
  const files = await readDiff(cwd, range.baseSha, range.headSha);
  const live = flattenHunks(files);
  return { files, coverage: joinCoverage(document, live) };
}

export function joinCoverage(document: ReviewDocument, live: LiveHunk[]): ReviewCoverage {
  const liveByKey = new Map<string, LiveHunk>();
  const liveByPath = new Map<string, LiveHunk[]>();
  for (const hunk of live) {
    const key = hunkKey(hunk);
    liveByKey.set(key, hunk);
    const atPath = liveByPath.get(hunk.path);
    if (atPath === undefined) {
      liveByPath.set(hunk.path, [hunk]);
    } else {
      atPath.push(hunk);
    }
  }

  const dirOf = dirOwners(document, live, liveByKey, liveByPath);
  const assignedKeys = new Set<string>();
  const allStale: ReviewHunkRef[] = [];
  const groups: GroupCoverage[] = document.groups.map((group) => {
    const hunks: LiveHunk[] = [];
    const dirHunks: LiveHunk[] = [];
    const seen = new Set<string>();
    const stale: ReviewHunkRef[] = [];
    for (const ref of group.hunkRefs) {
      if (!isDirHunkRef(ref) && isLockfilePath(ref.path)) {
        continue;
      }
      const matches = isDirHunkRef(ref)
        ? live.filter((hunk) => dirOf.get(hunkKey(hunk)) === ref.dir)
        : refMatches(ref, liveByKey, liveByPath);
      if (isDirHunkRef(ref)) {
        dirHunks.push(...matches);
      }
      if (matches.length === 0) {
        stale.push(ref);
        allStale.push(ref);
        continue;
      }
      for (const match of matches) {
        const key = hunkKey(match);
        assignedKeys.add(key);
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        hunks.push(match);
      }
    }
    return { group, hunks, dirHunks, stale };
  });

  const unassigned = live.filter((hunk) => {
    const key = hunkKey(hunk);
    return !assignedKeys.has(key);
  });
  return {
    groups,
    unassigned,
    stale: allStale,
    totalHunks: live.length,
    assignedHunks: assignedKeys.size,
  };
}

export function coverageErrors(coverage: ReviewCoverage): string[] {
  const errors: string[] = [];
  if (coverage.unassigned.length > 0) {
    errors.push(
      `coverage: ${coverage.unassigned.length} hunk(s) are not referenced by any group:\n${formatRefs(
        coverage.unassigned.map(toHunkRef),
      )}`,
    );
  }
  if (coverage.stale.length > 0) {
    errors.push(
      `stale: ${coverage.stale.length} ref(s) do not match the live git diff:\n${formatRefs(coverage.stale)}`,
    );
  }
  return errors;
}

function refMatches(
  ref: FileHunkRef | LocatedHunkRef,
  liveByKey: Map<string, LiveHunk>,
  liveByPath: Map<string, LiveHunk[]>,
): LiveHunk[] {
  if (!isLocatedHunkRef(ref)) {
    return liveByPath.get(ref.path) ?? [];
  }
  const match = liveByKey.get(hunkKey(ref));
  return match === undefined ? [] : [match];
}

/**
 * The most specific ref wins: a directory ref holds a hunk only when no path or hunk ref in any
 * group names it, and then only the deepest directory ref above it does. Keys are hunk keys.
 */
function dirOwners(
  document: ReviewDocument,
  live: LiveHunk[],
  liveByKey: Map<string, LiveHunk>,
  liveByPath: Map<string, LiveHunk[]>,
): Map<string, string> {
  const named = new Set<string>();
  const dirs: string[] = [];
  for (const ref of document.groups.flatMap((group) => group.hunkRefs)) {
    if (isDirHunkRef(ref)) {
      dirs.push(ref.dir);
      continue;
    }
    for (const hunk of refMatches(ref, liveByKey, liveByPath)) {
      named.add(hunkKey(hunk));
    }
  }
  const owners = new Map<string, string>();
  if (dirs.length === 0) {
    return owners;
  }
  for (const hunk of live) {
    const key = hunkKey(hunk);
    if (named.has(key) || isLockfilePath(hunk.path)) {
      continue;
    }
    const deepest = dirs
      .filter((dir) => refCoversPath({ dir }, hunk.path))
      .reduce<string | undefined>(
        (best, dir) => (best === undefined || dir.length > best.length ? dir : best),
        undefined,
      );
    if (deepest !== undefined) {
      owners.set(key, deepest);
    }
  }
  return owners;
}

/**
 * A directory ref stands for mechanical files only. Each other file under it needs a path ref
 * in the group of its concern, which takes it out of the directory ref.
 */
export function dirRefErrors(coverage: ReviewCoverage, files: DiffFile[]): string[] {
  const kinds = new Map(buildDigest(files).files.map((file) => [file.path, file.kind]));
  const errors: string[] = [];
  for (const { group, dirHunks } of coverage.groups) {
    const paths = [
      ...new Set(
        dirHunks
          .map((hunk) => hunk.path)
          .filter((path) => {
            const kind = kinds.get(path);
            return kind !== undefined && !isMechanicalKind(kind);
          }),
      ),
    ];
    if (paths.length > 0) {
      errors.push(
        `dir ref: group ${group.id} holds files that are not mechanical through a directory ref. Name each path in the group of its concern:\n${paths.map((path) => `  ${path}`).join("\n")}`,
      );
    }
  }
  return errors;
}

function formatRefs(refs: ReviewHunkRef[]): string {
  return refs.map((ref) => `  ${formatStoredHunkRef(ref)}`).join("\n");
}
