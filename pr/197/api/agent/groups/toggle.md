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

Review concern 04 of 05: Rendered or Source (`toggle`)

The what:

`HunkView` and the full file viewer (`Inspector`) show rendered Markdown in place of the Pierre source view, and one shared choice in `markdown-view.ts` switches every file.

Depends on:
- 03 The rendered rows (`view`)

Hunk refs for this concern:
- src/ui/components/HunkView.tsx
- src/ui/components/Inspector.tsx
- src/ui/lib/markdown-view.ts
- src/ui/App.tsx