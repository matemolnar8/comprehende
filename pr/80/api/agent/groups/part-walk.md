Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 8344a4a460d19d8216fedc94ac71f5c1866aa1a1` and `git rev-parse --verify f865bbb76de68ee5750ec0db3a02261094831d26` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 8344a4a460d19d8216fedc94ac71f5c1866aa1a1 f865bbb76de68ee5750ec0db3a02261094831d26 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  8344a4a460d19d8216fedc94ac71f5c1866aa1a1

head               f865bbb76de68ee5750ec0db3a02261094831d26

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 8344a4a460d19d8216fedc94ac71f5c1866aa1a1 f865bbb76de68ee5750ec0db3a02261094831d26

Review concern 01 of 02: Scope [ ] to the current part (`part-walk`)

The why:

[#69](source:s1) wants `[` `]` inside one story. The header pager from #73 stays; only the walk changes.

The what:

`neighborSelection` walks Overview plus the current part in `dependsOn` order. From Overview that is the first part. `{` `}` still hop parts.

Hunk refs for this concern:
- src/ui/lib/selection.ts @@ -1,7 +1,7 @@
- src/ui/lib/selection.ts @@ -111,7 +111,7 @@
- src/ui/lib/selection.ts @@ -122,6 +122,26 @@
- src/ui/lib/selection.test.ts @@ -195,12 +195,15 @@
- src/ui/lib/selection.test.ts @@ -214,4 +217,11 @@