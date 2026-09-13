Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 95879630ef53ba6bd6da25c6958a19fe06786fe0` and `git rev-parse --verify aece9b956fb88e22b77355743e7ca0eadffe645b` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 aece9b956fb88e22b77355743e7ca0eadffe645b -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  95879630ef53ba6bd6da25c6958a19fe06786fe0

head               aece9b956fb88e22b77355743e7ca0eadffe645b

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 aece9b956fb88e22b77355743e7ca0eadffe645b

Review concern 04 of 04: Focus and stack counts (`focus-stack`)

The why:

A jump has to land on a claim. The stack should show that claims exist before you open Overview.

The what:

`App` stores focusLookForKey, and Sidebar prints Look for counts on Overview and on groups that have bullets.

Look for:
- selectFromNav clears focusLookForKey. openLookFor sets it, then selectWithMotion.
- Sidebar shows Look for · N only when the count is greater than 0.

Depends on:
- 02 Look for lane (`look-for-lane`)
- 03 Sources jump (`sources-lane`)

Hunk refs for this concern:
- src/ui/App.tsx @@ -15,10 +15,11 @@
- src/ui/App.tsx @@ -36,6 +37,7 @@
- src/ui/App.tsx @@ -125,6 +127,23 @@
- src/ui/App.tsx @@ -188,15 +207,15 @@
- src/ui/App.tsx @@ -223,11 +242,14 @@
- src/ui/App.tsx @@ -251,25 +273,36 @@
- src/ui/App.tsx @@ -311,12 +344,14 @@
- src/ui/App.tsx @@ -329,7 +364,7 @@
- src/ui/App.tsx @@ -363,7 +398,7 @@
- src/ui/components/Sidebar.tsx @@ -20,6 +20,8 @@
- src/ui/components/Sidebar.tsx @@ -31,6 +33,7 @@
- src/ui/components/Sidebar.tsx @@ -44,6 +47,7 @@
- src/ui/components/Sidebar.tsx @@ -84,6 +88,7 @@
- src/ui/components/Sidebar.tsx @@ -91,6 +96,7 @@
- src/ui/components/Sidebar.tsx @@ -100,8 +106,10 @@
- src/ui/components/Sidebar.tsx @@ -138,6 +146,11 @@