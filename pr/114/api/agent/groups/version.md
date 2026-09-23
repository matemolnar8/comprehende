Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 4c59452449c16ba800b5753c21f1202692cc242c` and `git rev-parse --verify d5011fce325fb0b8497129914cd9f56404c53218` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 4c59452449c16ba800b5753c21f1202692cc242c d5011fce325fb0b8497129914cd9f56404c53218 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  4c59452449c16ba800b5753c21f1202692cc242c

head               d5011fce325fb0b8497129914cd9f56404c53218

Named refs at pin: 4c59452449c16ba800b5753c21f1202692cc242c ... d5011fce325fb0b8497129914cd9f56404c53218

Read the diff:

git diff --find-renames 4c59452449c16ba800b5753c21f1202692cc242c d5011fce325fb0b8497129914cd9f56404c53218

Review concern 01 of 02: Version and next-skill pin (`version`)

The why:

CI publishes a version that is not on npm yet, and the skill pin must match the package.

The what:

`package.json` moves to 0.9.0 and `pnpm sync:skill` rewrites the `npx comprehende@` pins in `skills-next/` and its `.agents/` copy.

Hunk refs for this concern:
- package.json
- skills-next/comprehende/SKILL.md
- .agents/skills/comprehende/SKILL.md