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

Review concern 05 of 05: An export keeps the highlighters of code fences (`fences`)

The what:

An export deletes the highlighter chunks the changed paths do not need. `markdownFences` now also reads the fence names of changed Markdown files, and the manifest maps a second name of a language to its chunk.

Attention (risk):
The change in `vite-shiki-langs.ts` fixes a bug older than this PR: `zsh`, `yml`, `dockerfile`, and `makefile` had no entry in the manifest, so an export dropped the chunk they load and a `.sh` file had no colors. It now reads `bundledLanguagesInfo` from `shiki`. Check an export of a change with a `.sh` or `.yml` file.

Depends on:
- 03 The rendered rows (`view`)

Hunk refs for this concern:
- src/api/markdown.ts
- src/api/markdown.test.ts
- src/api/live.ts
- src/api/snapshot.ts
- src/api/shiki-langs.ts
- src/api/shiki-langs.test.ts
- vite-shiki-langs.ts