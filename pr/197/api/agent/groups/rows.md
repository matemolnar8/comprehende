Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 1036bd6dbbaae3d2be13ad8c892224795f834ddf` and `git rev-parse --verify 9bc33a83c67a94f1e38265b3074b57711f616ef8` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 1036bd6dbbaae3d2be13ad8c892224795f834ddf 9bc33a83c67a94f1e38265b3074b57711f616ef8 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  1036bd6dbbaae3d2be13ad8c892224795f834ddf

head               9bc33a83c67a94f1e38265b3074b57711f616ef8

Named refs at pin: origin/main ... origin/t3/rendered-markdown-diff

Read the diff:

git diff --find-renames 1036bd6dbbaae3d2be13ad8c892224795f834ddf 9bc33a83c67a94f1e38265b3074b57711f616ef8

Review concern 01 of 05: Rows and word marks (`rows`)

The what:

`markdownRows` in `markdown-diff.ts` splits both sides of a file into blocks and uses git's hunk lines to pair them into context rows, change rows, and code rows. `wordMarks` marks the words that differ.

Attention (tradeoff):
`joinEdits` replaces the 60% rule and the 150 ms limit. Two changes join when the words kept between them are no longer than either change, and `unitMarks` gives no marks to a block with no word kept. A paragraph that was mostly rewritten now shows marks on most of its text, where before it showed only its tint. Decide if that reads better on your skill diffs.

Hunk refs for this concern:
- package.json
- src/ui/lib/markdown-diff.ts
- src/ui/lib/markdown-diff.test.ts