Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify d6b0b7728aa0777132d7a1685f6d136672588918` and `git rev-parse --verify cf1b6f04c4b41e0e3246d6f78432f82241d29e36` in this repository.
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
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  d6b0b7728aa0777132d7a1685f6d136672588918

head               cf1b6f04c4b41e0e3246d6f78432f82241d29e36

Named refs at pin: origin/main ... t3/skill-substeps

Read the diff:

git diff --find-renames d6b0b7728aa0777132d7a1685f6d136672588918 cf1b6f04c4b41e0e3246d6f78432f82241d29e36

Commits:
- cf1b6f04 Skill: Workflow steps as lettered substeps, branch-only material in references

Sources:
- pr PR #175 Restructure the skill text with no behavior change: lettered substeps, grouping criteria in step 3, branch-only material in references. Eval results across variants.
  https://github.com/matemolnar8/comprehende/pull/175

The title:

Skill steps split into substeps with done lines; rare branches move to references

The why:

The Workflow steps grew long because each feature landed in the step that owns its tool call, and steps repeated rules from their sections ([PR #175](source:s1)). Material only some runs need sat in the file every run reads ([PR #175](source:s1)).

The what (medium):

`SKILL.md` splits Workflow steps 2, 3, and 4 into lettered substeps with done lines. Refresh, Export, stacked requests, and the local CLI move to files under `references/` behind pointers.

## Review concerns

### 01 Workflow steps as lettered substeps (`substeps`)

Each lettered substep in steps 2, 3, and 4 names one action and ends on its own done line, and the grouping done list moves from step 4 into step 3b.

[groups/substeps.md](groups/substeps.md)

### 02 Branch-only material moves to references (`disclosure`)

Pointers in `SKILL.md` name the trigger for each new file under `references/`, which runs the CLI as `<cli>`; the hunks at new lines 23 and 121 also hold substep text from the first group.

Attention (tradeoff):
Refresh, Export, stacks, and the local CLI now load only when their pointer fires. No eval case runs those paths ([PR #175](source:s1)), so a pointer the agent skips goes unnoticed. Decide whether reading the pointer wording is enough proof.

[groups/disclosure.md](groups/disclosure.md)

### 03 Generated skill copy (`generated`)

Each file under `.agents/skills/comprehende/` repeats its `skills-next/comprehende/` source byte for byte, so the reader can skip this group.

[groups/generated.md](groups/generated.md)