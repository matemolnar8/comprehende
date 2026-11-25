Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify fe03571cd177e5f7f16352b0b4b68b39721b2e56` and `git rev-parse --verify 5485056e4c2fd250bc5c751de58acdc001afec6f` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames fe03571cd177e5f7f16352b0b4b68b39721b2e56 5485056e4c2fd250bc5c751de58acdc001afec6f -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  fe03571cd177e5f7f16352b0b4b68b39721b2e56

head               5485056e4c2fd250bc5c751de58acdc001afec6f

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames fe03571cd177e5f7f16352b0b4b68b39721b2e56 5485056e4c2fd250bc5c751de58acdc001afec6f

Review concern 02 of 04: Accept the readonly diff (`readonly-callers`)

Part: Serve

The what:

Each function that takes the diff now takes `readonly DiffFile[]`. The reader can skip it: only parameter types change.

Hunk refs for this concern:
- src/git/diff.ts@490+532
- src/api/live.ts
- src/git/moved.test.ts
- src/review/batch.ts
- src/review/coverage.ts
- src/review/digest.ts
- src/review/refresh.ts