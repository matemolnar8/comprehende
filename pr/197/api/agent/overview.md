Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 5d26d12f70f859a5cd029e6ba8f4d9aa75dd7818` and `git rev-parse --verify 5e68f4fc47f282a293c39af83e9a3c1cccd6ab02` in this repository.
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

base (merge-base)  5d26d12f70f859a5cd029e6ba8f4d9aa75dd7818

head               5e68f4fc47f282a293c39af83e9a3c1cccd6ab02

Named refs at pin: origin/main ... origin/t3/rendered-markdown-diff

Read the diff:

git diff --find-renames 5d26d12f70f859a5cd029e6ba8f4d9aa75dd7818 5e68f4fc47f282a293c39af83e9a3c1cccd6ab02

Commits:
- 5e68f4fc Merge remote-tracking branch 'origin/main' into t3/rendered-markdown-diff
- 61385491 Markdown diff: a markup-only change keeps the rendered block; a block that renders as nothing shows only where it changed
- 9bc33a83 Markdown diff: an image path with a bare % keeps its other escapes
- 14fcefa5 Markdown diff: review fixes
- 2939efdd Markdown diff: HTML, images, code blocks as line diffs, the full file viewer, and no limits on word marks
- ce2013c1 Export keeps the highlighter of a language with a second name
- cbd5aa0b Markdown diff: an image whose path changed shows its source; a moved block keeps its look in a markup-only row
- 59822864 Markdown diff: show the source of a block when only its markup changed; keep table column alignment
- 7df12e03 Markdown files read as rendered prose in the diff

Sources:
- pr PR #197
  https://github.com/matemolnar8/comprehende/pull/197

The title:

Read Markdown diffs as rendered Markdown, with the changed words marked

The why:

[PR #197](source:s1) says a skill's Markdown is hard to read in a line diff: a paragraph is one long line, so a two-word edit shows as a whole red and a whole green line. The owner's review then asked for the same view in the full file viewer, for HTML and images to render, for code blocks with line diffs and colors, and for word marks without a percent or time limit.

The what (large):

A Markdown file in a review renders as Markdown and still shows what changed: old blocks in red, new blocks in green, changed words marked, code blocks as line diffs.

Things to check:
- Read the skill rewrite in the demo the [PR](source:s1) links, and judge if the word marks on rewritten paragraphs help or are noise.

## Review concerns

### 01 Rows and word marks (`rows`)

`markdownRows` in `markdown-diff.ts` splits both sides of a file into blocks and uses git's hunk lines to pair them into context rows, change rows, and code rows. `wordMarks` marks the words that differ. A row where only markup changed keeps its rendered blocks and adds their source lines.

Attention (tradeoff):
`joinEdits` replaces the 60% rule and the 150 ms limit. Two changes join when the words kept between them are no longer than either change, and `unitMarks` gives no marks to a block with no word kept. A paragraph that was mostly rewritten now shows marks on most of its text, where before it showed only its tint. Decide if that reads better on your skill diffs.

[groups/rows.md](groups/rows.md)

### 02 Rows are made off the main thread (`worker`)

`markdownRowsJob` in `markdown-rows.ts` sends both sides of a file to `markdown.worker.ts` and resolves with the rows, or with `null` when the worker fails.

Attention (tradeoff):
The rows are made in the browser, in a worker, and not when the CLI writes the payload. Making them in the CLI would add the Markdown and HTML parsers to its runtime dependencies, which today are `zod` only. The worker chunk is 339 kB before gzip. Decide if you want the rows in the payload after all.

Depends on:
- 01 Rows and word marks (`rows`)

[groups/worker.md](groups/worker.md)

### 03 The rendered rows (`view`)

`MarkdownDiff` draws the rows in one column or two. A code block goes through Pierre (`PierreSnippet`, `PierreSnippetDiff`), an image loads from the web or from git, and a link that does not open says why.

Attention (product):
`imageTarget` loads a web image as it is, so a hosted review calls the image's host. A path in the repository loads only when the image is part of the change: the payload has no other images, and those show their alt text with the reason. Decide if the payload must hold every image a changed Markdown file names.

Depends on:
- 01 Rows and word marks (`rows`)
- 02 Rows are made off the main thread (`worker`)

[groups/view.md](groups/view.md)

### 04 Rendered or Source (`toggle`)

`HunkView` and the full file viewer (`Inspector`) show rendered Markdown in place of the Pierre source view, and one shared choice in `markdown-view.ts` switches every file.

Depends on:
- 03 The rendered rows (`view`)

[groups/toggle.md](groups/toggle.md)

### 05 An export keeps the highlighters of code fences (`fences`)

An export deletes the highlighter chunks the changed paths do not need. `markdownFences` now also reads the fence names of changed Markdown files, and the manifest maps a second name of a language to its chunk.

Attention (risk):
The change in `vite-shiki-langs.ts` fixes a bug older than this PR: `zsh`, `yml`, `dockerfile`, and `makefile` had no entry in the manifest, so an export dropped the chunk they load and a `.sh` file had no colors. It now reads `bundledLanguagesInfo` from `shiki`. Check an export of a change with a `.sh` or `.yml` file.

Depends on:
- 03 The rendered rows (`view`)

[groups/fences.md](groups/fences.md)