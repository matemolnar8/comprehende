Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 23f5f584b0321b64a98b59e554cc1bab2316fe7b` and `git rev-parse --verify c3e1a51d9a6f10789e560b76eb1cb9fd231b8014` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  23f5f584b0321b64a98b59e554cc1bab2316fe7b

head               c3e1a51d9a6f10789e560b76eb1cb9fd231b8014

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 23f5f584b0321b64a98b59e554cc1bab2316fe7b c3e1a51d9a6f10789e560b76eb1cb9fd231b8014

Commits:
- c3e1a51 Remove symbol pills from the file header.

Sources:
- ticket #129 The pills under a file path are more confusing than useful. Drop them. Keep the path, hunk range, counts, and Viewed control.
  https://github.com/matemolnar8/comprehende/issues/129

The title:

Remove Tier / Action / Suite pills under the file path

The why:

[#129](source:s1) says the pills under a file path are more confusing than useful.

The what (trivial):

The file header no longer shows names parsed from added lines. The path, hunk range, counts, and Viewed control stay.

## Review concerns

### 01 File header pills (`file-header`)

The file header stops drawing a pill for each added declaration name.

[groups/file-header.md](groups/file-header.md)