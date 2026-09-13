Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 93c542dbcdb7bd3989b30739234770d83021fe5a` and `git rev-parse --verify 4167e5fece3f0b0fa6a8a5c21d1381319dc363d5` in this repository.
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

base (merge-base)  93c542dbcdb7bd3989b30739234770d83021fe5a

head               4167e5fece3f0b0fa6a8a5c21d1381319dc363d5

Named refs at pin: 93c542dbcdb7bd3989b30739234770d83021fe5a ... 4167e5fece3f0b0fa6a8a5c21d1381319dc363d5

Read the diff:

git diff --find-renames 93c542dbcdb7bd3989b30739234770d83021fe5a 4167e5fece3f0b0fa6a8a5c21d1381319dc363d5

Commits:
- 4167e5f 0.8.0

Sources:
- transcript Cursor session · Sep 13 Do a new release. Include release notes in the commit message and a note in AGENTS.md so it is automatic in the future.
- pr PR #82 Minor since 0.7.0. CI publishes 0.8.0 when this lands on main.
  https://github.com/matemolnar8/comprehende/pull/82
- commit 0.8.0 Ship the review UI, skill, and hosting work since 0.7.0, and require those notes in the release commit body.
  https://github.com/matemolnar8/comprehende/commit/4167e5fece3f0b0fa6a8a5c21d1381319dc363d5

The title:

0.8.0

The why:

[The request](source:s1) asks for a new release, with release notes in the commit, and an `AGENTS.md` note so later releases do the same.

The what (small):

`package.json` is 0.8.0, the skill pin matches, `pnpm release:skill` copies document lookFor into `skills/comprehende/`, and `AGENTS.md` requires those notes in the release commit body.

Look for:
- [The request](source:s1) asks for release notes in the commit message. No hunk is a changelog; the notes are the 0.8.0 commit body.

## Review concerns

### 01 Version pin (`pin`)

`package.json` is 0.8.0. README and the next, installed, and published skill files pin `npx comprehende@0.8.0`.

[groups/pin.md](groups/pin.md)

### 02 Published skill (`publish-skill`)

`pnpm release:skill` copies document lookFor into `skills/comprehende/` (SKILL.md, example, and schema).

Depends on:
- 01 Version pin (`pin`)

[groups/publish-skill.md](groups/publish-skill.md)

### 03 Release notes in AGENTS.md (`notes`)

The Releases paragraph in `AGENTS.md` tells the agent to put those notes in the release commit body.

[groups/notes.md](groups/notes.md)