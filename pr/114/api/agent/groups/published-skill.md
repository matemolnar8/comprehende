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

Review concern 02 of 02: Published skill (`published-skill`)

The why:

`npx skills add` reads only `skills/comprehende/`, so the skill that matches the new CLI ships in the same change.

The what:

`pnpm release:skill` copies `skills-next/comprehende/` onto `skills/comprehende/`: the `review` workflow, string hunk refs, and the regenerated schema.

Depends on:
- 01 Version and next-skill pin (`version`)

Hunk refs for this concern:
- skills/comprehende/SKILL.md
- skills/comprehende/references/example.md
- skills/comprehende/references/review.schema.json