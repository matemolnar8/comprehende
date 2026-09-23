Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 4b954d780efe076b16352c2916c6ec402f9ca743` and `git rev-parse --verify 955f062a0d58d886e1dd09ce1bcfbb6d9e2857ae` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  4b954d780efe076b16352c2916c6ec402f9ca743

head               955f062a0d58d886e1dd09ce1bcfbb6d9e2857ae

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 4b954d780efe076b16352c2916c6ec402f9ca743 955f062a0d58d886e1dd09ce1bcfbb6d9e2857ae

Commits:
- 955f062 Keep the file rail's reading mark and relocation labels.
- 905f33c Show git renames, copies, and moved lines in the diff.

Sources:
- ticket #110 Show a copy, move, or rename as relocated content, using git's own detection, without storing patch text.
  https://github.com/matemolnar8/comprehende/issues/110

The title:

Show copy, move, and rename in the diff

The why:

A unified diff shows a move as a full delete plus a full add. [#110](source:s1) asks the review to show the relationship git already knows.

The what (small):

The live diff records git's rename, copy, and moved-line marks, and the UI shows that relationship on the file.

Look for:
- Subtle. [#110](source:s1) asks the UI to mark relocated content, and the line text stays the live git diff.

## Review concerns

### 01 Git names the move (`git-relocation`)

The live diff stores the similarity score, a header for a pure path change, and the lines git marks as moved.

[groups/git-relocation.md](groups/git-relocation.md)

### 02 The diff shows the relationship (`diff-ui`)

Headers show Renamed, Moved, or Copied with the similarity. A moved block shows one chip. A pure path change has no line body.

Depends on:
- 01 Git names the move (`git-relocation`)

[groups/diff-ui.md](groups/diff-ui.md)