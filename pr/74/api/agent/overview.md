Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 65101753c30111b03422e5767c623c098d96f3cb` and `git rev-parse --verify 98d61ee83050a1404d4dc8a583f66ff0ee6b98c2` in this repository.
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

base (merge-base)  65101753c30111b03422e5767c623c098d96f3cb

head               98d61ee83050a1404d4dc8a583f66ff0ee6b98c2

Named refs at pin: 65101753c30111b03422e5767c623c098d96f3cb ... 98d61ee83050a1404d4dc8a583f66ff0ee6b98c2

Read the diff:

git diff --find-renames 65101753c30111b03422e5767c623c098d96f3cb 98d61ee83050a1404d4dc8a583f66ff0ee6b98c2

Commits:
- 98d61ee Require writing-for-agents when editing the comprehende skill
- 1f13a23 Install writing-for-agents from mattpocock/skills

Sources:
- transcript Cursor session · Sep 13 Install writing-for-agents like other third-party skills, then require it when editing the comprehende skill. Do not rewrite that skill or bump package.json.
- pr PR #74 Vendors the skill via skills-lock.json and .agents/skills, and adds the AGENTS.md rule.
  https://github.com/matemolnar8/comprehende/pull/74

The title:

Install writing-for-agents and require it for the comprehende skill

The why:

The [Cursor session](source:s1) and [PR #74](source:s2) ask to vendor `writing-for-agents` and require it when agents edit the comprehende skill.

The what (small):

The repo pins `writing-for-agents` in `skills-lock.json` and copies it under `.agents/skills/writing-for-agents`. `AGENTS.md` requires that skill before edits to `skills-next/comprehende/SKILL.md` and before `pnpm release:skill` or `pnpm sync:skill`.

Look for:
- [The session](source:s1) says do not rewrite `skills-next/comprehende/SKILL.md`. No hunk touches that file.
- [The session](source:s1) says do not bump `package.json` version. No hunk touches `package.json`.

## Review concerns

### 01 Vendored writing-for-agents (`vendor`)

`skills-lock.json` pins `mattpocock/skills`, and `.agents/skills/writing-for-agents` holds `SKILL.md`, `SKILL-MECHANICS.md`, and `agents/openai.yaml`.

[groups/vendor.md](groups/vendor.md)

### 02 AGENTS.md rule (`policy`)

`AGENTS.md` Project rules require that skill before `skills-next/comprehende/SKILL.md` edits and before `pnpm release:skill` or `pnpm sync:skill`.

Depends on:
- 01 Vendored writing-for-agents (`vendor`)

[groups/policy.md](groups/policy.md)