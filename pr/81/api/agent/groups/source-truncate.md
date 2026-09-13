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

Review concern 06 of 06: Truncate long source labels (`source-truncate`)

Part: Brief type

The why:

[Cursor session · Sep 13](source:s4) showed a commit label overflowing the Sources row on a narrow pane. [337dd8a](source:s5) caps the label.

The what:

Source labels cap at 40% and truncate. The gist is `flex-1 truncate` inside an `overflow-hidden` row.

Look for:
- For label `4243b14 Reject unknown values in the table extra config array` at ~390px, the label shows an ellipsis and the gist still truncates in the remaining width.

Depends on:
- 04 Hanging brief fields and one title size (`hanging-brief`)
- 03 Wire hops to HashLink (`wire-hops`)

Hunk refs for this concern:
- src/ui/components/SourceList.tsx @@ -45,38 +48,37 @@