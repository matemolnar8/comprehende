Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 0856bd3aab23ba57f237ebb4f2d727b65e0655af` and `git rev-parse --verify d6a529bc7809dc9302df686259e8bb39003cd422` in this repository.
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

base (merge-base)  0856bd3aab23ba57f237ebb4f2d727b65e0655af

head               d6a529bc7809dc9302df686259e8bb39003cd422

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 0856bd3aab23ba57f237ebb4f2d727b65e0655af d6a529bc7809dc9302df686259e8bb39003cd422

Commits:
- d6a529b Batch ref checks into the review shell and inline the field shape.

Sources:
- ticket #108 A Muse session still read example.md, then verified refs in a shell before review.
  https://github.com/matemolnar8/comprehende/issues/108

The title:

Skill: avoid the example read and batch ref verification

The why:

[#108](source:s1) asks the skill to drop a dedicated example.md read and to verify refs in the same shell as review.

The what (small):

The skill writes review.json from a field shape in SKILL.md. One shell call verifies the refs, checks the CLI version, and runs review, log, and stat.

Look for:
- [#108](source:s1) also asks smoke eval to pass and the review to stay valid. This diff states the instructions. The eval trace is the check.

## Review concerns

### 01 Skill workflow (`workflow`)

SKILL.md names the field shape and batches git rev-parse --verify with review, log, and stat.

[groups/workflow.md](groups/workflow.md)

### 02 Workflow lock (`test`)

skill.test.ts checks the batched shell and the inline field shape.

Depends on:
- 01 Skill workflow (`workflow`)

[groups/test.md](groups/test.md)