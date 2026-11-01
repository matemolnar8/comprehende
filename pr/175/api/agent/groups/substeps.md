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

Review concern 01 of 03: Workflow steps as lettered substeps (`substeps`)

The why:

Long steps mixed many actions and checked grouping one step late ([PR #175](source:s1)).

The what:

Each lettered substep in steps 2, 3, and 4 names one action and ends on its own done line, and the grouping done list moves from step 4 into step 3b.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md@23+23
- skills-next/comprehende/SKILL.md@42+47
- skills-next/comprehende/SKILL.md@65+97
- skills-next/comprehende/SKILL.md@91+121