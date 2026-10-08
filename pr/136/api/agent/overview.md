Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 23f5f584b0321b64a98b59e554cc1bab2316fe7b` and `git rev-parse --verify 6c6a46dba2e0aeff52c94070dc19dc86ce07ebc1` in this repository.
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

head               6c6a46dba2e0aeff52c94070dc19dc86ce07ebc1

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 23f5f584b0321b64a98b59e554cc1bab2316fe7b 6c6a46dba2e0aeff52c94070dc19dc86ce07ebc1

Commits:
- 6c6a46d Leave resolved and outdated review comments unpinned

Sources:
- ticket #128 Outdated and resolved comments show on the review, sometimes in the wrong location.
  https://github.com/matemolnar8/comprehende/issues/128

The title:

Leave outdated comments unpinned

The why:

[#128](source:s1) says outdated and resolved comments show on the review, sometimes in the wrong location.

The what (trivial):

A review comment is pinned only when it still sits on one line at head and its thread is open.

## Review concerns

### 01 Open-thread line pin (`pin`)

The skill pins the forge's current line on an open thread. The glossary states that pin, the test locks the wording, and the installed skill file is an identical copy.

[groups/pin.md](groups/pin.md)