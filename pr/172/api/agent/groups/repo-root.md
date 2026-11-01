Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify f9d12b75708f86c165bb8249aa024f7914a785ef` and `git rev-parse --verify 5d59f087125233c028b0b844984838da3e3df2bf` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames f9d12b75708f86c165bb8249aa024f7914a785ef 5d59f087125233c028b0b844984838da3e3df2bf -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  f9d12b75708f86c165bb8249aa024f7914a785ef

head               5d59f087125233c028b0b844984838da3e3df2bf

Named refs at pin: origin/main ... t3/agent-deep-links

Read the diff:

git diff --find-renames f9d12b75708f86c165bb8249aa024f7914a785ef 5d59f087125233c028b0b844984838da3e3df2bf

Review concern 01 of 03: Work tree path in the review payload (`repo-root`)

The why:

Claude Code and Codex can open in the reviewed folder under `serve`, and [hosted reviews need their own path handling](source:s2): an export must not name a folder on the machine that wrote it.

The what:

`readRepoIdentity` reads the work tree top, `reviewPayload` sends it as `repo.root`, and `exportStaticSite` replaces it with null before it writes any file.

Attention (contract):
`api/review.json` gains `repo.root`: the work tree top under `serve`, null in an export. The exported payload differs from the live one in that field only, and `export.test.ts` checks the rest still match.

Hunk refs for this concern:
- src/git/repo.ts
- src/api/types.ts
- src/api/live.ts
- src/api/snapshot.ts
- src/api/export.test.ts
- src/api/agent-md.test.ts