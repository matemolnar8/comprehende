Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 12dc578a96810c629d63f94bcecac8b92a395800` and `git rev-parse --verify 337dd8ad67526981781d98e930041010ae467d85` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 12dc578a96810c629d63f94bcecac8b92a395800 337dd8ad67526981781d98e930041010ae467d85 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  12dc578a96810c629d63f94bcecac8b92a395800

head               337dd8ad67526981781d98e930041010ae467d85

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 12dc578a96810c629d63f94bcecac8b92a395800 337dd8ad67526981781d98e930041010ae467d85

Review concern 01 of 06: Prefer the current group for a shared source (`prefer-group`)

Part: Source hops

The why:

[PR #81](source:s1) reports that a source cited on document lookFor and on a group jumped to Overview. [83f549c](source:s2) names the find-first bug.

The what:

`openTargetForSource` prefers a line pin, then a lookFor owned by `currentGroupId`, then `groupSourceIds` on that group, then any group lookFor, named `group.sources`, document lookFor, Overview.

Look for:
- From group `login`, a ticket cited in document lookFor and in `login` lookFor opens `#group/login` and focuses `group:login:0`, not Overview.
- A source listed on `group.sources` with no lookFor cite still stays on that group when it is current.

Hunk refs for this concern:
- src/ui/App.tsx @@ -328,12 +328,22 @@
- src/ui/App.tsx @@ -343,7 +353,7 @@
- src/ui/App.tsx @@ -352,8 +362,9 @@
- src/ui/lib/look-for.ts @@ -1,5 +1,5 @@
- src/ui/lib/look-for.ts @@ -140,6 +140,7 @@
- src/ui/lib/look-for.ts @@ -147,13 +148,30 @@
- src/ui/lib/look-for.test.ts @@ -230,6 +230,17 @@
- src/ui/lib/look-for.test.ts @@ -237,10 +248,41 @@
- src/ui/lib/sources-context.tsx @@ -1,11 +1,13 @@