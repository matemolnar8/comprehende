Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 95879630ef53ba6bd6da25c6958a19fe06786fe0` and `git rev-parse --verify e8f9455cedd00c1d9849edece23a810faeb25d51` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 e8f9455cedd00c1d9849edece23a810faeb25d51 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  95879630ef53ba6bd6da25c6958a19fe06786fe0

head               e8f9455cedd00c1d9849edece23a810faeb25d51

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 e8f9455cedd00c1d9849edece23a810faeb25d51

Review concern 02 of 03: Previous and next chrome (`chrome`)

Part: Group walk

The why:

[#70](source:s1) asks for chrome so a human can walk groups without hunting in the sidebar.

The what:

`GroupNav` shows neighbor titles. `ReviewStage` mounts the bar. `MobileShell` mounts the chevrons.

Depends on:
- 01 Neighbor walk (`walk`)

Hunk refs for this concern:
- src/ui/components/GroupNav.tsx @@ -0,0 +1,101 @@
- src/ui/components/ReviewStage.tsx @@ -7,6 +7,7 @@
- src/ui/components/ReviewStage.tsx @@ -52,44 +53,49 @@
- src/ui/components/MobileShell.tsx @@ -6,6 +6,7 @@
- src/ui/components/MobileShell.tsx @@ -44,6 +45,7 @@