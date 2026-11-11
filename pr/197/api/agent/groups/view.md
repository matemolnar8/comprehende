Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 5d26d12f70f859a5cd029e6ba8f4d9aa75dd7818` and `git rev-parse --verify 3e9d01a694d3739984ee303dcf0765053d08344e` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 5d26d12f70f859a5cd029e6ba8f4d9aa75dd7818 3e9d01a694d3739984ee303dcf0765053d08344e -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  5d26d12f70f859a5cd029e6ba8f4d9aa75dd7818

head               3e9d01a694d3739984ee303dcf0765053d08344e

Named refs at pin: origin/main ... origin/t3/rendered-markdown-diff

Read the diff:

git diff --find-renames 5d26d12f70f859a5cd029e6ba8f4d9aa75dd7818 3e9d01a694d3739984ee303dcf0765053d08344e

Review concern 03 of 05: The rendered rows (`view`)

The what:

`MarkdownDiff` draws the rows in one column or two. A code block goes through Pierre (`PierreSnippet`, `PierreSnippetDiff`), an image loads from the web or from git, and a link that does not open says why.

Attention (product):
`imageTarget` loads a web image as it is, so a hosted review calls the image's host. Decide if that is fine for a review you share, or if web images must wait for a click.

Depends on:
- 01 Rows and word marks (`rows`)
- 02 Rows are made off the main thread (`worker`)

Hunk refs for this concern:
- src/ui/components/MarkdownDiff.tsx
- src/ui/components/MarkdownDiff.module.css
- src/ui/PierreDiff.tsx