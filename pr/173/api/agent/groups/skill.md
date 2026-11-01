Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify de6c86b23284d2dc40e2633828c3854e1e8e6b1a` and `git rev-parse --verify 1308bb9768274e14fa889edd8d238870c3b9f39d` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames de6c86b23284d2dc40e2633828c3854e1e8e6b1a 1308bb9768274e14fa889edd8d238870c3b9f39d -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  de6c86b23284d2dc40e2633828c3854e1e8e6b1a

head               1308bb9768274e14fa889edd8d238870c3b9f39d

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames de6c86b23284d2dc40e2633828c3854e1e8e6b1a 1308bb9768274e14fa889edd8d238870c3b9f39d

Review concern 04 of 06: Skill rule and glossary (`skill`)

The why:

The skill decides how often notes appear, which sets how noisy a review gets.

The what:

The new File notes section in `SKILL.md` asks for a note on each file of a multi-file group unless the group `summary` covers it, and the glossary defines File note.

Attention (product):
The rule asks for a note on every file of a group with two or more files. In the `comprehende-57` smoke run that was 11 notes over 3 groups. Decide whether that density fits the noise budget, or whether notes should be only for files the summary leaves unclear.

Depends on:
- 01 Schema and validate (`contract`)

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- skills-next/comprehende/references/example.md
- docs/glossary.md