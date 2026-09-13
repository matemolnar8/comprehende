Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 30060c417b8961cba2924a994cf9b6a07213c674` and `git rev-parse --verify 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 30060c417b8961cba2924a994cf9b6a07213c674 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  30060c417b8961cba2924a994cf9b6a07213c674

head               15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8

Named refs at pin: 30060c417b8961cba2924a994cf9b6a07213c674 ... 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8

Read the diff:

git diff --find-renames 30060c417b8961cba2924a994cf9b6a07213c674 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8

Review concern 03 of 04: App wiring for jumps (`wiring`)

Part: Look for lanes

The why:

Clicks on claims and sources have to change selection without dropping the #75 pager.

The what:

`App.tsx` keeps `[` `]` and `{` `}` on `selectFromNav`, and opens lookFor plus sources through `openLookFor` and `openSource`.

Look for:
- Press `]` from Overview: lookFor focus clears. Header chevrons use the same `selectFromNav` path.

Depends on:
- 01 Claim model and jump targets (`model`)
- 02 Overview index and group lists (`surfaces`)

Hunk refs for this concern:
- src/ui/App.tsx @@ -23,10 +23,11 @@
- src/ui/App.tsx @@ -44,6 +45,7 @@
- src/ui/App.tsx @@ -133,6 +135,23 @@
- src/ui/App.tsx @@ -196,23 +215,23 @@
- src/ui/App.tsx @@ -239,11 +258,14 @@
- src/ui/App.tsx @@ -267,25 +289,36 @@
- src/ui/App.tsx @@ -326,12 +359,14 @@
- src/ui/App.tsx @@ -344,7 +379,7 @@
- src/ui/App.tsx @@ -357,7 +392,7 @@
- src/ui/App.tsx @@ -380,7 +415,7 @@
- src/ui/components/ReviewStage.tsx @@ -8,6 +8,7 @@
- src/ui/components/ReviewStage.tsx @@ -38,6 +39,8 @@
- src/ui/components/ReviewStage.tsx @@ -57,7 +60,13 @@
- src/ui/components/ReviewStage.tsx @@ -86,6 +95,7 @@
- src/ui/lib/sources-context.tsx @@ -5,6 +5,7 @@