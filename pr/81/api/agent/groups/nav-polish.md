Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify df873e1ce47b46b505633f316d2b6c4c4bffb04a` and `git rev-parse --verify eb01e4a6ff3b0b2876b368712a7947d70ab1ac22` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames df873e1ce47b46b505633f316d2b6c4c4bffb04a eb01e4a6ff3b0b2876b368712a7947d70ab1ac22 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  df873e1ce47b46b505633f316d2b6c4c4bffb04a

head               eb01e4a6ff3b0b2876b368712a7947d70ab1ac22

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames df873e1ce47b46b505633f316d2b6c4c4bffb04a eb01e4a6ff3b0b2876b368712a7947d70ab1ac22

Review concern 02 of 02: Look for chevrons and hash links (`nav-polish`)

The why:

The same review asked for Overview lookFor to start open, with chevrons and link-like hops, so the ranking is usable.

The what:

`HashLink` writes the selection hash. Overview lookFor starts expanded with a disclosure chevron. Sidebar, lookFor rows, and sources use those links. Source labels match lookFor claim text.

Look for:
- On Overview, the document lookFor details start open and show a chevron that rotates when the section closes.
- Look for group rows, source labels, and sidebar titles are underlined on the text node so a flex hop still reads as a link.

Depends on:
- 01 Prefer the current group (`source-open`)

Hunk refs for this concern:
- src/ui/components/GroupBrief.tsx @@ -1,12 +1,12 @@
- src/ui/components/GroupBrief.tsx @@ -110,9 +110,13 @@
- src/ui/components/HashLink.tsx @@ -0,0 +1,39 @@
- src/ui/components/LookForList.module.css @@ -0,0 +1,19 @@
- src/ui/components/LookForList.tsx @@ -1,14 +1,17 @@
- src/ui/components/LookForList.tsx @@ -77,14 +80,14 @@
- src/ui/components/LookForList.tsx @@ -106,8 +109,16 @@
- src/ui/components/LookForList.tsx @@ -122,15 +133,14 @@
- src/ui/components/LookForList.tsx @@ -139,11 +149,19 @@
- src/ui/components/Overview.tsx @@ -1,13 +1,13 @@
- src/ui/components/Overview.tsx @@ -95,15 +95,15 @@
- src/ui/components/Overview.tsx @@ -115,15 +115,14 @@
- src/ui/components/Overview.tsx @@ -137,6 +136,7 @@
- src/ui/components/Overview.tsx @@ -146,7 +146,7 @@
- src/ui/components/Sidebar.tsx @@ -2,11 +2,11 @@
- src/ui/components/Sidebar.tsx @@ -31,7 +31,8 @@
- src/ui/components/Sidebar.tsx @@ -44,19 +45,19 @@
- src/ui/components/Sidebar.tsx @@ -68,7 +69,8 @@
- src/ui/components/Sidebar.tsx @@ -87,7 +89,8 @@
- src/ui/components/Sidebar.tsx @@ -99,7 +102,8 @@
- src/ui/components/Sidebar.tsx @@ -115,7 +119,8 @@
- src/ui/components/Sidebar.tsx @@ -142,14 +147,13 @@
- src/ui/components/Sidebar.tsx @@ -161,6 +165,7 @@
- src/ui/components/Sidebar.tsx @@ -169,7 +174,7 @@
- src/ui/components/Sidebar.tsx @@ -183,6 +188,6 @@
- src/ui/components/SourceList.tsx @@ -1,8 +1,8 @@
- src/ui/components/SourceList.tsx @@ -13,7 +13,9 @@
- src/ui/components/SourceList.tsx @@ -28,14 +30,16 @@
- src/ui/components/SourceList.tsx @@ -45,33 +49,32 @@
- src/ui/lib/plain-click.test.ts @@ -0,0 +1,19 @@
- src/ui/lib/plain-click.ts @@ -0,0 +1,9 @@
- src/ui/lib/sources-context.tsx @@ -1,11 +1,13 @@