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

Review concern 01 of 03: Hash scheme (`hash`)

Part: Hash route

The why:

The App and the tests need one encoding for overview, groups, and buckets.

The what:

`parseHash` and `serializeHash` replace JSON sessionStorage. `hashWriteMode` replaces dead hashes and pushes live hops.

Look for:
- Subtle. `hashWriteMode` replaces `#bogus` and `#group/gone`. A live hop from `#overview` to `#group/auth` pushes.

Hunk refs for this concern:
- src/ui/lib/selection.ts @@ -2,7 +2,6 @@
- src/ui/lib/selection.ts @@ -23,39 +22,76 @@
- src/ui/lib/selection.ts @@ -75,14 +111,6 @@
- src/ui/lib/selection.test.ts @@ -2,16 +2,18 @@
- src/ui/lib/selection.test.ts @@ -21,30 +23,49 @@
- src/ui/lib/selection.test.ts @@ -72,6 +93,29 @@
- src/ui/lib/selection.test.ts @@ -214,4 +258,15 @@