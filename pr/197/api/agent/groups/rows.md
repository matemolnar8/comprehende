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

Review concern 01 of 03: Rows from git's lines (`rows`)

The what:

`markdownRows` in `markdown-diff.ts` splits both sides of a file into blocks and uses git's hunk lines to pair them into context rows and change rows.

Attention (tradeoff):
`wordMarks` marks no words in a block when more than 60% of its words changed (`REWRITE_SHARE`), and stops after 150 ms (`WORD_DIFF_MS`). Such a block shows only its red or green tint. Two unrelated texts of 9,000 words each took 11 s to compare without the limit. Decide if these two numbers fit your skill diffs.

Hunk refs for this concern:
- package.json
- src/ui/lib/markdown-diff.ts
- src/ui/lib/markdown-diff.test.ts