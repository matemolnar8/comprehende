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

Review concern 02 of 06: HashLink and plain-click guard (`hash-link`)

Part: Source hops

The why:

Sidebar, sources, look-for hops, and story hops need one `<a href>` that still runs in-app select on an unmodified left click.

The what:

`HashLink` writes `serializeHash` and calls `onSelect` only when `isPlainLeftClick` is true. `hashLinkText` is hover underline for running text.

Look for:
- Cmd-click or middle-click on a hop follows the hash in a new tab and does not call `onSelect`.

Hunk refs for this concern:
- src/ui/components/HashLink.tsx @@ -0,0 +1,39 @@
- src/ui/lib/plain-click.ts @@ -0,0 +1,9 @@
- src/ui/lib/plain-click.test.ts @@ -0,0 +1,19 @@