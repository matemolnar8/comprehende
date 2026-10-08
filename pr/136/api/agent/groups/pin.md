Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 23f5f584b0321b64a98b59e554cc1bab2316fe7b` and `git rev-parse --verify 6c6a46dba2e0aeff52c94070dc19dc86ce07ebc1` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 23f5f584b0321b64a98b59e554cc1bab2316fe7b 6c6a46dba2e0aeff52c94070dc19dc86ce07ebc1 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
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

Review concern 01 of 01: Open-thread line pin (`pin`)

The why:

[#128](source:s1) says an outdated or resolved comment shows on the review, sometimes on the wrong line.

The what:

The skill pins the forge's current line on an open thread. The glossary states that pin, the test locks the wording, and the installed skill file is an identical copy.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- .agents/skills/comprehende/SKILL.md
- docs/glossary.md
- scripts/eval/skill.test.ts