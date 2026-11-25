Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify fe03571cd177e5f7f16352b0b4b68b39721b2e56` and `git rev-parse --verify 5485056e4c2fd250bc5c751de58acdc001afec6f` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames fe03571cd177e5f7f16352b0b4b68b39721b2e56 5485056e4c2fd250bc5c751de58acdc001afec6f -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  fe03571cd177e5f7f16352b0b4b68b39721b2e56

head               5485056e4c2fd250bc5c751de58acdc001afec6f

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames fe03571cd177e5f7f16352b0b4b68b39721b2e56 5485056e4c2fd250bc5c751de58acdc001afec6f

Review concern 03 of 04: Load images by screen priority (`lazy-cards`)

Part: Image cards

The what:

`ImageDiff` asks `useImage` for each side with the card's place from `useViewportPriority`: on screen, within 1.5 screens, or far.

Attention (tradeoff):
`image-loader.ts` keeps every finished image as a Blob with an object URL for the page's life, and never revokes them: about 340 MB for 100 screenshot pairs. In return no image downloads twice, since `serve` sends image URLs with `no-store`, and the pixel diff worker reads the same Blob. Chrome moves large blobs to disk.

Hunk refs for this concern:
- src/ui/lib/image-loader.ts
- src/ui/lib/near-viewport.ts
- src/ui/components/ImageDiff.tsx