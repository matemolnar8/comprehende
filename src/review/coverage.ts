import { flattenHunks, readDiff, toHunkRef } from "../git/diff.ts";
import { pinRange, type PinnedRange } from "../git/repo.ts";
import { formatStoredHunkRef, hunkKey, isLocatedHunkRef } from "../schema/identity.ts";
import { isLockfilePath } from "../schema/lockfile.ts";
import type { LiveHunk, ReviewDocument, ReviewGroup, ReviewHunkRef } from "../schema/types.ts";

export type GroupCoverage = {
  group: ReviewGroup;
  hunks: LiveHunk[];
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

  const assignedKeys = new Set<string>();
  const allStale: ReviewHunkRef[] = [];
  const groups: GroupCoverage[] = document.groups.map((group) => {
    const hunks: LiveHunk[] = [];
    const seen = new Set<string>();
    const stale: ReviewHunkRef[] = [];
    for (const ref of group.hunkRefs) {
      if (isLockfilePath(ref.path)) {
        continue;
      }
      const matches = isLocatedHunkRef(ref) ? matchLocated(ref, liveByKey) : (liveByPath.get(ref.path) ?? []);
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
    return { group, hunks, stale };
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

function matchLocated(ref: ReviewHunkRef, liveByKey: Map<string, LiveHunk>): LiveHunk[] {
  if (!isLocatedHunkRef(ref)) {
    return [];
  }
  const match = liveByKey.get(hunkKey(ref));
  return match === undefined ? [] : [match];
}

function formatRefs(refs: ReviewHunkRef[]): string {
  return refs.map((ref) => `  ${formatStoredHunkRef(ref)}`).join("\n");
}
