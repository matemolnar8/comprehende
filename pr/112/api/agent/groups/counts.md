Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify d68a36eb83b8d412745643c86db7be65851f1c01` and `git rev-parse --verify fe3f8acbfa301232ca8380ef4377aee004f1d3f5` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames d68a36eb83b8d412745643c86db7be65851f1c01 fe3f8acbfa301232ca8380ef4377aee004f1d3f5 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  d68a36eb83b8d412745643c86db7be65851f1c01

head               fe3f8acbfa301232ca8380ef4377aee004f1d3f5

Named refs at pin: main ... HEAD

Read the diff:

git diff --find-renames d68a36eb83b8d412745643c86db7be65851f1c01 fe3f8acbfa301232ca8380ef4377aee004f1d3f5

Review concern 01 of 03: Count files left (`counts`)

Part: Files left

The why:

[Issue #111](source:s1) asks for a remaining count of files the reader has not looked at. This module is that count.

The what:

`readingCounts` and `readingStatus` name how many paths are still left, and `reviewReadingPaths` keeps each path once.

Look for:
- A path listed by two groups counts once in the review total. A viewed path that is gone from the diff does not raise the count.

Hunk refs for this concern:
- src/ui/lib/reading-progress.ts
- src/ui/lib/reading-progress.test.ts