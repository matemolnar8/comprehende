Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 95879630ef53ba6bd6da25c6958a19fe06786fe0` and `git rev-parse --verify e91cd52b349b2a9d148910cbd0b57f1145d4e2a0` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 e91cd52b349b2a9d148910cbd0b57f1145d4e2a0 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  95879630ef53ba6bd6da25c6958a19fe06786fe0

head               e91cd52b349b2a9d148910cbd0b57f1145d4e2a0

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 e91cd52b349b2a9d148910cbd0b57f1145d4e2a0

Review concern 04 of 06: Group pager and Needed by (`pager`)

Part: Story navigation

The why:

A human on a group needs a click target for the same hops the keys use. [The session](source:s4) names the dependents label Needed by.

The what:

`StoryNav` is the prev/next row. `GroupBrief` links Depends on and Needed by, then renders that pager.

Look for:
- On the last group of a mixed review, the right control is Next part, not the next group of another story.
- The dependents HopList label is Needed by, not Then.

Depends on:
- 02 Previous, next, and next part (`hops`)

Hunk refs for this concern:
- src/ui/components/StoryNav.tsx @@ -0,0 +1,59 @@
- src/ui/components/GroupBrief.tsx @@ -1,14 +1,17 @@
- src/ui/components/GroupBrief.tsx @@ -39,15 +42,18 @@
- src/ui/components/GroupBrief.tsx @@ -64,23 +70,8 @@
- src/ui/components/GroupBrief.tsx @@ -88,7 +79,36 @@
- src/ui/components/Group.tsx @@ -1,4 +1,4 @@
- src/ui/components/Group.tsx @@ -14,7 +14,6 @@
- src/ui/components/Group.tsx @@ -33,7 +32,7 @@
- src/ui/components/Group.tsx @@ -93,10 +92,8 @@
- src/ui/components/ReviewStage.tsx @@ -24,7 +24,6 @@
- src/ui/components/ReviewStage.tsx @@ -70,7 +69,6 @@