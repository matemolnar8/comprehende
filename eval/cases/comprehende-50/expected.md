# comprehende-50: Add an Export branch for uploading the report

PR #50. No ticket, no comments.

## Story

- Title: the PR title.
- Why: present, from the PR. The skill had no path for a user who asks to upload the report. Do not add a motive about sharing outside localhost.
- Size: small.
- Parts: 1 or 2. Groups: 2.

## Groups

1. Export branch in the skill: `skills-next/comprehende/SKILL.md` and its identical copy `.agents/skills/comprehende/SKILL.md`. The summary says the copy is identical.
2. PR publishing in `AGENTS.md`. No `dependsOn` to group 1. It is repo process that can be read alone.

## Must state

- The PR says agents publish with VibeDrop (`@vibedrop/cli`) and use a VibeDrop skill. `AGENTS.md` at head uses an anonymous Netlify deploy and puts the URL and password in the PR body. No VibeDrop skill is added.

## Good to state

- Unclaimed Netlify sites last one hour, so the review link in a PR body stops working after that.

## Must not

- Do not split the two `SKILL.md` copies by folder.

## Baseline

- 6 of 6 runs stated the VibeDrop claim.
- 4 of 6 chained the `AGENTS.md` group to the skill group with `dependsOn`, which the grader marked major.

## case.json

- `together`: both `SKILL.md` copies.
- `apart`: `AGENTS.md` and the skill.
- Added the VibeDrop claim.
