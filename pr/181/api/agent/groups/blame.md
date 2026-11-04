Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 587e7aebf3074a2288cf7bee6eacfddba4bb3073` and `git rev-parse --verify bb865b7baa24a3c16de3c9282e41c4d095c15628` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 587e7aebf3074a2288cf7bee6eacfddba4bb3073 bb865b7baa24a3c16de3c9282e41c4d095c15628 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  587e7aebf3074a2288cf7bee6eacfddba4bb3073

head               bb865b7baa24a3c16de3c9282e41c4d095c15628

Named refs at pin: 587e7aeb ... bb865b7b

Read the diff:

git diff --find-renames 587e7aebf3074a2288cf7bee6eacfddba4bb3073 bb865b7baa24a3c16de3c9282e41c4d095c15628

Review concern 06 of 08: Blame shows the commit summary (`blame`)

The why:

The design reviews in the [session](source:s2) ask for blame runs a reviewer can read without opening each commit. The [PR](source:s1) lists it under Blame.

The what:

`parseBlamePorcelain` in `blame.ts` reads each commit's `summary` line, `groupBlameRuns` carries it on each run, and the `BlameStamp` in `PierreDiff.tsx` shows it in the `Inspector` Blame mode.

Attention (product):
`BlameStamp` shows the summary and the In this review badge only when `meta.inRange`. A run from a commit before base shows its SHA, author, and date, with no summary. The reviewer decides whether older summaries would help or only add noise.

Depends on:
- 05 Diff cards (`diff`)

Hunk refs for this concern:
- src/git/blame.ts
- src/git/blame.test.ts
- src/schema/blame-runs.ts
- src/schema/blame-runs.test.ts
- src/api/types.ts
- src/server/http.test.ts
- src/ui/components/Inspector.tsx
- src/ui/PierreDiff.tsx