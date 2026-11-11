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

Review concern 05 of 05: What changed Markdown needs: images and highlighters (`assets`)

The what:

The image endpoint now reads any image path at the two commits of the review, not only the images of the diff. An export holds the images that changed Markdown files show (`markdownAssets`), and keeps the highlighter chunks their code fences name.

Attention (risk):
`imagePayload` in `live.ts` no longer needs the path to be a file of the diff: `serve` gives any image of the repository at base or head, and an export copies each image a changed Markdown file names. The change in `vite-shiki-langs.ts` fixes a bug older than this PR: `zsh`, `yml`, `dockerfile`, and `makefile` had no entry in the manifest, so an export dropped the chunk they load. Check an export of a repository whose README shows images you do not want in a shared review.

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
- src/api/image.test.ts
- src/test/image-repo.ts