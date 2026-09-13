Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 30060c417b8961cba2924a994cf9b6a07213c674` and `git rev-parse --verify 4779db00491f81c01848be0c1a452efe167232e8` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 30060c417b8961cba2924a994cf9b6a07213c674 4779db00491f81c01848be0c1a452efe167232e8 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  30060c417b8961cba2924a994cf9b6a07213c674

head               4779db00491f81c01848be0c1a452efe167232e8

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 30060c417b8961cba2924a994cf9b6a07213c674 4779db00491f81c01848be0c1a452efe167232e8

Review concern 03 of 03: Serve and export share the hash (`docs`)

Part: Hash route

The why:

[#78](source:s1) requires the same hash on `comprehende serve` and on a static export.

The what:

The README names the hash strings. The export test checks that serve and export return the same UI shell.

Hunk refs for this concern:
- README.md @@ -42,7 +42,7 @@
- src/api/export.test.ts @@ -58,6 +58,12 @@