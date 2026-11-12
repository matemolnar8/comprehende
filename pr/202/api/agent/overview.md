Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 922754fef250ce6f4d0d9143922a154c9143be89` and `git rev-parse --verify d1aecb7823b859694dd84bfa4bcac08bfc88aeaa` in this repository.
   Done when both objects exist.

2. Choose the relevant review concerns.
   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.
   Done when every concern the question touches has its markdown loaded.

3. Answer from live git.
   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.
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

Commits:
- d1aecb78 UI: widen the slider clip comment to transparent base pixels
- 727b7537 UI: clip the head image in the slider so a smaller base does not show it

Sources:
- transcript Claude Code session · Nov 12 Slider shows only the new image for a smaller old one

The title:

Slider shows the base when it is smaller than the head

The why:

The [image diff slider showed only the new image](source:s1) when the old image was smaller than the new one.

The what (trivial):

The image slider clips each image to its own side of the line.

## Review concerns

### 01 Clip both slider layers (`slider-clip`)

`WipeStage` now clips the head to the right of the line and the base to the left, each with `clip-path`.

Attention (product):
Left of the line, the reader now sees only the base. `StageImage` fits each image with `object-fit: contain`, so a base with a different shape leaves empty room; that room and any transparent base pixels now show the checker bench, not the head. Side by side already shows the base this way.

[groups/slider-clip.md](groups/slider-clip.md)