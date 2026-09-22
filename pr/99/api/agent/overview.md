Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a05aef85c489e9ccd5c42f7b3397219b35b95719` and `git rev-parse --verify afe0cb057f5dda1c09bc66a2012a0b06ca60156a` in this repository.
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

base (merge-base)  a05aef85c489e9ccd5c42f7b3397219b35b95719

head               afe0cb057f5dda1c09bc66a2012a0b06ca60156a

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a05aef85c489e9ccd5c42f7b3397219b35b95719 afe0cb057f5dda1c09bc66a2012a0b06ca60156a

Commits:
- afe0cb0 Name the commit source label as the git subject or SHA.
- ef5469d Exclude only lockfiles from the covering change.
- 84fb302 Record producer steps and stop pinning the version skip to step 1.
- b96b809 Batch skill workflow commands and drop the schema pointer.

Sources:
- ticket #96 Land proposals C and D from the token-efficiency report in skills-next. No schema, CLI, or UI change.
  https://github.com/matemolnar8/comprehende/issues/96
- pr PR #99 Implements #96 in skills-next and syncs the installed skill. Eval prompt and step counts follow the new workflow numbering.
  https://github.com/matemolnar8/comprehende/pull/99
- pr-comment matemolnar8 on PR #99
  https://github.com/matemolnar8/comprehende/pull/99#discussion_r4069403142

The title:

Skill: batch workflow commands and drop the schema read

The why:

[#96](source:s1) asks for skill-only token efficiency: batch the producer commands, drop the schema read, and name what validate checks.

The what (small):

The next skill batches shell calls, uses example.md as the shape reference, lists validate checks, and writes review.json once. Lockfile excludes come from the covering `--stat`. Eval skips the npm version check without pinning it to step 1, and records producer steps and tool calls.

Look for:
- [#96](source:s1) also asks for smoke and full eval numbers plus a producer token/step comparison versus main in the PR body. No hunk writes those figures; they are produced after this diff.

## Review concerns

### 01 Next skill workflow (`skill`)

`skills-next/comprehende/SKILL.md` batches producer shell calls, points at example.md, excludes lockfiles from the covering `--stat`, and names commit source labels.

[groups/skill.md](groups/skill.md)

### 02 Installed skill mirror (`installed`)

`.agents/skills/comprehende` repeats the same SKILL.md and example.md edits.

Depends on:
- 01 Next skill workflow (`skill`)

[groups/installed.md](groups/installed.md)

### 03 Eval prompt and measurement (`eval`)

The producer prompt drops "in step 1". Agent runs record LLM steps and tool calls, and tests lock the skill wording and the prompt.

[groups/eval.md](groups/eval.md)