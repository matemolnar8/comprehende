Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify fe03571cd177e5f7f16352b0b4b68b39721b2e56` and `git rev-parse --verify 1671733faea758db55156ed744d7c515324a5610` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames fe03571cd177e5f7f16352b0b4b68b39721b2e56 1671733faea758db55156ed744d7c515324a5610 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  fe03571cd177e5f7f16352b0b4b68b39721b2e56

head               1671733faea758db55156ed744d7c515324a5610

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames fe03571cd177e5f7f16352b0b4b68b39721b2e56 1671733faea758db55156ed744d7c515324a5610

Review concern 01 of 04: Cache the pinned diff (`diff-cache`)

Part: Serve

The what:

`readDiff` keeps the promise for a pair of full SHAs, so every `serve` request after the first reuses one diff.

Attention (contract):
`readDiff` now returns one shared array for the same SHA pair, typed `readonly DiffFile[]`. The type stops a caller from pushing or sorting the array, but not from changing a `DiffFile` inside it: such a write would show in every later request until the process ends. No caller writes to a `DiffFile` at head.

Hunk refs for this concern:
- src/git/diff.ts@36+36
- src/git/diff.test.ts