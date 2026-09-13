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

Review concern 02 of 02: Drop the group-page pager (`drop-pager`)

The why:

The header already has the group pager. A second bar on the group page competes with it. Depends on and Needed by stay as click hops.

The what:

`StoryNav` is removed. `storyNav` only lists Depends on and Needed by hops. `GroupBrief` keeps those links and the lookFor lane from #76.

Depends on:
- 01 Scope [ ] to the current part (`part-walk`)

Hunk refs for this concern:
- src/ui/components/GroupBrief.tsx @@ -5,14 +5,13 @@
- src/ui/components/GroupBrief.tsx @@ -52,7 +51,7 @@
- src/ui/components/GroupBrief.tsx @@ -88,7 +87,6 @@
- src/ui/components/StoryNav.tsx @@ -1,59 +0,0 @@
- src/ui/lib/story-nav.ts @@ -1,94 +1,32 @@
- src/ui/lib/story-nav.test.ts @@ -5,66 +5,31 @@
- src/ui/lib/story-nav.test.ts @@ -72,6 +37,10 @@