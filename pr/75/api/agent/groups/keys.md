Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 95879630ef53ba6bd6da25c6958a19fe06786fe0` and `git rev-parse --verify e55fb2c9294ff84b08f0e0d1b0aa7f5c158f0e06` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 e55fb2c9294ff84b08f0e0d1b0aa7f5c158f0e06 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  95879630ef53ba6bd6da25c6958a19fe06786fe0

head               e55fb2c9294ff84b08f0e0d1b0aa7f5c158f0e06

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 e55fb2c9294ff84b08f0e0d1b0aa7f5c158f0e06

Review concern 03 of 06: Keyboard stays in the story (`keys`)

Part: Story navigation

The why:

[#69](source:s1) wants `[` `]` to stay in one dependsOn chain, and a separate move between parts.

The what:

`shiftStorySelection` walks `storyNav` previous/next. `shiftPartSelection` opens the first group of the adjacent part. `App.tsx` binds `[` `]` and `{` `}`.

Look for:
- On the last group of a part, `]` keeps the same selection. `}` opens the first group of the next part.

Depends on:
- 02 Previous, next, and next part (`hops`)

Hunk refs for this concern:
- src/ui/lib/selection.ts @@ -1,16 +1,22 @@
- src/ui/lib/selection.ts @@ -79,7 +85,11 @@
- src/ui/lib/selection.ts @@ -89,20 +99,56 @@
- src/ui/lib/selection.ts @@ -130,10 +176,11 @@
- src/ui/App.tsx @@ -13,7 +13,15 @@
- src/ui/App.tsx @@ -194,9 +202,13 @@
- src/ui/App.tsx @@ -302,7 +314,6 @@