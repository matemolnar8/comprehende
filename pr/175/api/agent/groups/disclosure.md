Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify d6b0b7728aa0777132d7a1685f6d136672588918` and `git rev-parse --verify cf1b6f04c4b41e0e3246d6f78432f82241d29e36` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames d6b0b7728aa0777132d7a1685f6d136672588918 cf1b6f04c4b41e0e3246d6f78432f82241d29e36 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  d6b0b7728aa0777132d7a1685f6d136672588918

head               cf1b6f04c4b41e0e3246d6f78432f82241d29e36

Named refs at pin: origin/main ... t3/skill-substeps

Read the diff:

git diff --find-renames d6b0b7728aa0777132d7a1685f6d136672588918 cf1b6f04c4b41e0e3246d6f78432f82241d29e36

Review concern 02 of 03: Branch-only material moves to references (`disclosure`)

The why:

Refresh, Export, stacks, and a local CLI are needed only on some runs, so they leave the file every run reads ([PR #175](source:s1)).

The what:

Pointers in `SKILL.md` name the trigger for each new file under `references/`, which runs the CLI as `<cli>`; the hunks at new lines 23 and 121 also hold substep text from the first group.

Attention (tradeoff):
Refresh, Export, stacks, and the local CLI now load only when their pointer fires. No eval case runs those paths ([PR #175](source:s1)), so a pointer the agent skips goes unnoticed. Decide whether reading the pointer wording is enough proof.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md@15+15
- skills-next/comprehende/SKILL.md@23+23
- skills-next/comprehende/SKILL.md@91+121
- skills-next/comprehende/SKILL.md@181+174
- skills-next/comprehende/references/refresh.md
- skills-next/comprehende/references/export.md
- skills-next/comprehende/references/stacks.md
- skills-next/comprehende/references/local-cli.md
- skills-next/comprehende/references/powershell.md
- scripts/eval/skill.test.ts