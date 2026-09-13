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

Review concern 01 of 03: Neighbor walk (`walk`)

Part: Group walk

The why:

[#70](source:s1) needs one ordered walk so chrome and keys share a neighbor, not a wrapping stack.

The what:

`groupWalk` and `neighborSelection` step overview then groups and return undefined at the ends.

Look for:
- Subtle. From Unassigned or Lockfiles, previous returns the last group. Next from those buckets does nothing.

Hunk refs for this concern:
- src/ui/lib/selection.ts @@ -89,18 +89,37 @@
- src/ui/lib/selection.ts @@ -122,6 +141,14 @@
- src/ui/lib/selection.test.ts @@ -1,11 +1,16 @@
- src/ui/lib/selection.test.ts @@ -81,4 +86,71 @@