Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 1036bd6dbbaae3d2be13ad8c892224795f834ddf` and `git rev-parse --verify cbd5aa0b3d044e87e62b55aa6a43c3aaaf706bf8` in this repository.
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

base (merge-base)  1036bd6dbbaae3d2be13ad8c892224795f834ddf

head               cbd5aa0b3d044e87e62b55aa6a43c3aaaf706bf8

Named refs at pin: origin/main ... origin/t3/rendered-markdown-diff

Read the diff:

git diff --find-renames 1036bd6dbbaae3d2be13ad8c892224795f834ddf cbd5aa0b3d044e87e62b55aa6a43c3aaaf706bf8

Commits:
- cbd5aa0b Markdown diff: an image whose path changed shows its source; a moved block keeps its look in a markup-only row
- 59822864 Markdown diff: show the source of a block when only its markup changed; keep table column alignment
- 7df12e03 Markdown files read as rendered prose in the diff

Sources:
- pr PR #197
  https://github.com/matemolnar8/comprehende/pull/197

The title:

Read Markdown diffs as rendered Markdown, with the changed words marked

The why:

[PR #197](source:s1) says a skill's Markdown is hard to read in a line diff: a paragraph is one long line, so a two-word edit shows as a whole red and a whole green line.

The what (medium):

A Markdown file in a review renders as Markdown and still shows what changed.

## Review concerns

### 01 Rows from git's lines (`rows`)

`markdownRows` in `markdown-diff.ts` splits both sides of a file into blocks and uses git's hunk lines to pair them into context rows and change rows.

Attention (tradeoff):
`wordMarks` marks no words in a block when more than 60% of its words changed (`REWRITE_SHARE`), and stops after 150 ms (`WORD_DIFF_MS`). Such a block shows only its red or green tint. Two unrelated texts of 9,000 words each took 11 s to compare without the limit. Decide if these two numbers fit your skill diffs.

[groups/rows.md](groups/rows.md)

### 02 The rendered rows (`view`)

`MarkdownDiff` draws the rows in one column or two, with the tints, notes, comments, and moved marks of the source diff.

Attention (product):
The rendered view does not run HTML, fetch images, or follow relative links. `rawHtml` shows a tag such as `<kbd>` as its source, `img` shows the alt text, and a relative link is a styled `span`. Only `http`, `https`, and `mailto` links open. Decide if a reviewer needs to see images of the repository here.

Depends on:
- 01 Rows from git's lines (`rows`)

[groups/view.md](groups/view.md)

### 03 Rendered or Source (`toggle`)

`HunkView` shows `MarkdownDiff` in place of `PierreFileDiff` for a Markdown file, and one shared choice in `markdown-view.ts` switches every file.

Depends on:
- 02 The rendered rows (`view`)

[groups/toggle.md](groups/toggle.md)