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

Review concern 03 of 06: Wire hops to HashLink (`wire-hops`)

Part: Source hops

The why:

[3f2bc56](source:s3) wants look-for rows, sources, sidebar titles, and story hops as real hash links so [PR #81](source:s1) source clicks share the same target.

The what:

Sidebar, Overview group rows, Look for index hops, SourceList jumps, and HopList use `HashLink`. Source rows call `selectionForSource`.

Look for:
- A SourceList row for a URL source still opens the external URL on the label, and the gist hops in-app through `selectionForSource`.

Depends on:
- 01 Prefer the current group for a shared source (`prefer-group`)
- 02 HashLink and plain-click guard (`hash-link`)

Hunk refs for this concern:
- src/ui/components/GroupBrief.tsx @@ -1,14 +1,14 @@
- src/ui/components/GroupBrief.tsx @@ -102,20 +104,25 @@
- src/ui/components/LookForList.module.css @@ -0,0 +1,19 @@
- src/ui/components/LookForList.tsx @@ -1,14 +1,20 @@
- src/ui/components/LookForList.tsx @@ -106,15 +111,23 @@
- src/ui/components/LookForList.tsx @@ -122,30 +135,29 @@
- src/ui/components/Overview.tsx @@ -1,15 +1,15 @@
- src/ui/components/Overview.tsx @@ -95,15 +91,15 @@
- src/ui/components/Overview.tsx @@ -115,38 +111,26 @@
- src/ui/components/Sidebar.tsx @@ -2,11 +2,11 @@
- src/ui/components/Sidebar.tsx @@ -31,7 +31,8 @@
- src/ui/components/Sidebar.tsx @@ -44,19 +45,19 @@
- src/ui/components/Sidebar.tsx @@ -68,7 +69,8 @@
- src/ui/components/Sidebar.tsx @@ -87,7 +89,8 @@
- src/ui/components/Sidebar.tsx @@ -99,7 +102,8 @@
- src/ui/components/Sidebar.tsx @@ -115,7 +119,8 @@
- src/ui/components/Sidebar.tsx @@ -142,14 +147,13 @@
- src/ui/components/Sidebar.tsx @@ -161,6 +165,7 @@
- src/ui/components/Sidebar.tsx @@ -183,6 +188,6 @@
- src/ui/components/SourceList.tsx @@ -1,9 +1,9 @@
- src/ui/components/SourceList.tsx @@ -13,7 +13,9 @@
- src/ui/components/SourceList.tsx @@ -45,38 +48,37 @@