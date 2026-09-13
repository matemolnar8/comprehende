Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 65101753c30111b03422e5767c623c098d96f3cb` and `git rev-parse --verify 98d61ee83050a1404d4dc8a583f66ff0ee6b98c2` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 65101753c30111b03422e5767c623c098d96f3cb 98d61ee83050a1404d4dc8a583f66ff0ee6b98c2 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
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

Review concern 01 of 02: Vendored writing-for-agents (`vendor`)

Part: writing-for-agents

The why:

[The Cursor session](source:s1) asks to install the skill and lock it like `frontend-design` and `unslop`.

The what:

`skills-lock.json` pins `mattpocock/skills`, and `.agents/skills/writing-for-agents` holds `SKILL.md`, `SKILL-MECHANICS.md`, and `agents/openai.yaml`.

Look for:
- The new `skills-lock.json` entry uses `source`, `sourceType`, `skillPath`, and `computedHash` only, the same shape as `frontend-design`.

Hunk refs for this concern:
- .agents/skills/writing-for-agents/SKILL-MECHANICS.md @@ -0,0 +1,22 @@
- .agents/skills/writing-for-agents/SKILL.md @@ -0,0 +1,81 @@
- .agents/skills/writing-for-agents/agents/openai.yaml @@ -0,0 +1,3 @@
- skills-lock.json @@ -17,6 +17,12 @@