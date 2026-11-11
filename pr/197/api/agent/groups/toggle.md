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

Review concern 03 of 03: Rendered or Source (`toggle`)

The what:

`HunkView` shows `MarkdownDiff` in place of `PierreFileDiff` for a Markdown file, and one shared choice in `markdown-view.ts` switches every file.

Depends on:
- 02 The rendered rows (`view`)

Hunk refs for this concern:
- src/ui/components/HunkView.tsx
- src/ui/lib/markdown-view.ts
- src/ui/App.tsx