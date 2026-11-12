Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 922754fef250ce6f4d0d9143922a154c9143be89` and `git rev-parse --verify d1aecb7823b859694dd84bfa4bcac08bfc88aeaa` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 922754fef250ce6f4d0d9143922a154c9143be89 d1aecb7823b859694dd84bfa4bcac08bfc88aeaa -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  922754fef250ce6f4d0d9143922a154c9143be89

head               d1aecb7823b859694dd84bfa4bcac08bfc88aeaa

Named refs at pin: 922754fe ... t3/fix-image-slider-smaller-old

Read the diff:

git diff --find-renames 922754fef250ce6f4d0d9143922a154c9143be89 d1aecb7823b859694dd84bfa4bcac08bfc88aeaa

Review concern 01 of 01: Clip both slider layers (`slider-clip`)

The what:

`WipeStage` now clips the head to the right of the line and the base to the left, each with `clip-path`.

Attention (product):
Left of the line, the reader now sees only the base. `StageImage` fits each image with `object-fit: contain`, so a base with a different shape leaves empty room; that room and any transparent base pixels now show the checker bench, not the head. Side by side already shows the base this way.

Hunk refs for this concern:
- src/ui/components/ImageDiff.tsx