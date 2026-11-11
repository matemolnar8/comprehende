Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 5d26d12f70f859a5cd029e6ba8f4d9aa75dd7818` and `git rev-parse --verify 5e68f4fc47f282a293c39af83e9a3c1cccd6ab02` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 5d26d12f70f859a5cd029e6ba8f4d9aa75dd7818 5e68f4fc47f282a293c39af83e9a3c1cccd6ab02 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
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

Review concern 02 of 05: Rows are made off the main thread (`worker`)

The what:

`markdownRowsJob` in `markdown-rows.ts` sends both sides of a file to `markdown.worker.ts` and resolves with the rows, or with `null` when the worker fails.

Attention (tradeoff):
The rows are made in the browser, in a worker, and not when the CLI writes the payload. Making them in the CLI would add the Markdown and HTML parsers to its runtime dependencies, which today are `zod` only. The worker chunk is 339 kB before gzip. Decide if you want the rows in the payload after all.

Depends on:
- 01 Rows and word marks (`rows`)

Hunk refs for this concern:
- src/ui/lib/markdown-rows.ts
- src/ui/lib/markdown.worker.ts
- vite.config.ts