Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 1036bd6dbbaae3d2be13ad8c892224795f834ddf` and `git rev-parse --verify cbd5aa0b3d044e87e62b55aa6a43c3aaaf706bf8` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 1036bd6dbbaae3d2be13ad8c892224795f834ddf cbd5aa0b3d044e87e62b55aa6a43c3aaaf706bf8 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  1036bd6dbbaae3d2be13ad8c892224795f834ddf

head               cbd5aa0b3d044e87e62b55aa6a43c3aaaf706bf8

Named refs at pin: origin/main ... origin/t3/rendered-markdown-diff

Read the diff:

git diff --find-renames 1036bd6dbbaae3d2be13ad8c892224795f834ddf cbd5aa0b3d044e87e62b55aa6a43c3aaaf706bf8

Review concern 02 of 03: The rendered rows (`view`)

The what:

`MarkdownDiff` draws the rows in one column or two, with the tints, notes, comments, and moved marks of the source diff.

Attention (product):
The rendered view does not run HTML, fetch images, or follow relative links. `rawHtml` shows a tag such as `<kbd>` as its source, `img` shows the alt text, and a relative link is a styled `span`. Only `http`, `https`, and `mailto` links open. Decide if a reviewer needs to see images of the repository here.

Depends on:
- 01 Rows from git's lines (`rows`)

Hunk refs for this concern:
- src/ui/components/MarkdownDiff.tsx
- src/ui/components/MarkdownDiff.module.css
- src/ui/PierreDiff.tsx