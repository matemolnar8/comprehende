Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify fe03571cd177e5f7f16352b0b4b68b39721b2e56` and `git rev-parse --verify 1671733faea758db55156ed744d7c515324a5610` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames fe03571cd177e5f7f16352b0b4b68b39721b2e56 1671733faea758db55156ed744d7c515324a5610 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  fe03571cd177e5f7f16352b0b4b68b39721b2e56

head               1671733faea758db55156ed744d7c515324a5610

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames fe03571cd177e5f7f16352b0b4b68b39721b2e56 1671733faea758db55156ed744d7c515324a5610

Review concern 03 of 04: Load images near the screen (`lazy-cards`)

Part: Image cards

The what:

`ImageDiff` loads a card's images when it comes within 1.5 screens, or when an idle queue in `near-viewport.ts` reaches it.

Attention (tradeoff):
A card keeps its images after it scrolls away, and the idle queue loads every remaining card one at a time. So a 100-card group still ends with all images loaded, as before; the gain is that the cards on screen load first and nothing loads during a scroll. Unmounting far images instead made returning cards fetch again, because `serve` sends image URLs with `no-store`, and showed empty frames.

Hunk refs for this concern:
- src/ui/lib/near-viewport.ts
- src/ui/components/ImageDiff.tsx