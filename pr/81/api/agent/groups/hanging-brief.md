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

Review concern 04 of 06: Hanging brief fields and one title size (`hanging-brief`)

Part: Brief type

The why:

[Cursor session · Sep 13](source:s4) asked for an intentional type scale: display only on the title, Why and What as body, Look for easy to find, nothing larger than the header.

The what:

`BriefField` hangs kickers in a 5.75rem column. Why, What, Look for, and Sources share `briefProse`. Title uses `--text-title` / `--text-title-sm`. Overview group rows drop display numerals.

Look for:
- Subtle. `--text-title` is 2.25rem, matching main after `Increase font size`. `text-title` and `text-foreground` both use the `text-` prefix; the title must still render at 2.25rem on desktop.

Hunk refs for this concern:
- src/ui/components/Group.tsx @@ -83,7 +83,7 @@
- src/ui/components/Group.tsx @@ -102,7 +102,7 @@
- src/ui/components/Group.tsx @@ -120,7 +120,7 @@
- src/ui/components/GroupBrief.tsx @@ -1,14 +1,14 @@
- src/ui/components/GroupBrief.tsx @@ -32,7 +32,7 @@
- src/ui/components/GroupBrief.tsx @@ -69,20 +69,22 @@
- src/ui/components/GroupBrief.tsx @@ -102,20 +104,25 @@
- src/ui/components/Kicker.tsx @@ -1,10 +1,35 @@
- src/ui/components/LookForList.tsx @@ -1,14 +1,20 @@
- src/ui/components/LookForList.tsx @@ -60,12 +71,9 @@
- src/ui/components/LookForList.tsx @@ -93,11 +101,8 @@
- src/ui/components/Overview.tsx @@ -1,15 +1,15 @@
- src/ui/components/Overview.tsx @@ -27,28 +27,24 @@
- src/ui/components/Overview.tsx @@ -58,7 +54,7 @@
- src/ui/components/Overview.tsx @@ -115,38 +111,26 @@
- src/ui/components/SourceList.tsx @@ -1,9 +1,9 @@
- src/ui/components/SourceList.tsx @@ -26,16 +28,17 @@
- src/ui/styles.css @@ -34,6 +34,10 @@