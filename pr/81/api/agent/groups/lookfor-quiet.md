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

Review concern 05 of 06: Quiet Overview look-for and single divides (`lookfor-quiet`)

Part: Brief type

The why:

[Cursor session · Sep 13](source:s4) said the hanging brief dumped too much at once, and double separator lines added noise. [337dd8a](source:s5) names the collapse.

The what:

Overview document look-for starts closed unless a document claim is focused. Lists use `briefRows` (`divide-y` only). Tagged claims hang the tag in a 4.75rem column.

Look for:
- Subtle. Nested document claims use `divide-y` with no `border-y`, so the parent index does not stack a double rule under the last claim.

Depends on:
- 04 Hanging brief fields and one title size (`hanging-brief`)

Hunk refs for this concern:
- src/ui/components/LookForList.tsx @@ -34,8 +40,9 @@
- src/ui/components/LookForList.tsx @@ -43,10 +50,14 @@
- src/ui/components/LookForList.tsx @@ -77,14 +85,14 @@
- src/ui/components/LookForList.tsx @@ -93,11 +101,8 @@
- src/ui/components/LookForList.tsx @@ -160,13 +172,13 @@