import { flattenHunks, readDiff, toHunkRef } from "../git/diff.ts";
import { hunkKey } from "../schema/identity.ts";
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
): Promise<{ files: Awaited<ReturnType<typeof readDiff>>; coverage: ReviewCoverage }> {
  const files = await readDiff(cwd, document.source.baseRef, document.source.headRef);
  const live = flattenHunks(files);
  return { files, coverage: joinCoverage(document, live) };
}

export function joinCoverage(document: ReviewDocument, live: LiveHunk[]): ReviewCoverage {
  const liveByKey = new Map<string, LiveHunk>();
  for (const hunk of live) {
    liveByKey.set(hunkKey(hunk), hunk);
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
      const match = liveByKey.get(hunkKey(ref));
      if (match === undefined) {
        stale.push(ref);
        allStale.push(ref);
        continue;
      }
      hunks.push(match);
      assignedKeys.add(hunkKey(match));
    }
    return { group, hunks, stale };
  });

  const unassigned = live.filter((hunk) => !assignedKeys.has(hunkKey(hunk)));
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
  return refs
    .map((ref) => {
      const rename = ref.oldPath !== undefined ? `${ref.oldPath} -> ` : "";
      return `  ${rename}${ref.path} @@ -${ref.oldStart},${ref.oldLines} +${ref.newStart},${ref.newLines} @@`;
    })
    .join("\n");
}
