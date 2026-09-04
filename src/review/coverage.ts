import { flattenHunks, readDiff, toHunkRef } from "../git/diff.ts";
import { pinRange, type PinnedRange } from "../git/repo.ts";
import { formatHunkRef, hunkKey } from "../schema/identity.ts";
import { isLockfilePath } from "../schema/lockfile.ts";
import type { HunkRef, LiveHunk, ReviewDocument, ReviewGroup } from "../schema/types.ts";

export type GroupCoverage = {
  group: ReviewGroup;
  hunks: LiveHunk[];
  stale: HunkRef[];
};

export type ReviewCoverage = {
  groups: GroupCoverage[];
  unassigned: LiveHunk[];
  stale: HunkRef[];
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
  for (const hunk of live) {
    const key = hunkKey(hunk);
    liveByKey.set(key, hunk);
  }

  const assignedKeys = new Set<string>();
  const allStale: HunkRef[] = [];
  const groups: GroupCoverage[] = document.groups.map((group) => {
    const hunks: LiveHunk[] = [];
    const stale: HunkRef[] = [];
    for (const ref of group.hunkRefs) {
      if (isLockfilePath(ref.path)) {
        continue;
      }
      const key = hunkKey(ref);
      const match = liveByKey.get(key);
      if (match === undefined) {
        stale.push(ref);
        allStale.push(ref);
        continue;
      }
      hunks.push(match);
      assignedKeys.add(key);
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
      `stale: ${coverage.stale.length} hunk ref(s) do not match the live git diff:\n${formatRefs(coverage.stale)}`,
    );
  }
  return errors;
}

function formatRefs(refs: HunkRef[]): string {
  return refs.map((ref) => `  ${formatHunkRef(ref)}`).join("\n");
}
