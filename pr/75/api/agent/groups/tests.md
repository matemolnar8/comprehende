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

Review concern 06 of 06: Order, hops, and key tests (`tests`)

Part: Story navigation

The why:

The order and hop helpers exist so later groups can trust them. The tests lock that contract.

The what:

`parts.test.ts`, `story-nav.test.ts`, and `selection.test.ts` cover dependsOn order, part hops, and `[` `]` staying in a part.

Depends on:
- 03 Keyboard stays in the story (`keys`)

Hunk refs for this concern:
- src/ui/lib/parts.test.ts @@ -1,6 +1,14 @@
- src/ui/lib/parts.test.ts @@ -41,6 +49,35 @@
- src/ui/lib/parts.test.ts @@ -73,4 +110,16 @@
- src/ui/lib/story-nav.test.ts @@ -0,0 +1,81 @@
- src/ui/lib/selection.test.ts @@ -4,8 +4,12 @@
- src/ui/lib/selection.test.ts @@ -82,3 +86,69 @@