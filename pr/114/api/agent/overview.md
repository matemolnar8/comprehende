Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 4c59452449c16ba800b5753c21f1202692cc242c` and `git rev-parse --verify d5011fce325fb0b8497129914cd9f56404c53218` in this repository.
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

base (merge-base)  4c59452449c16ba800b5753c21f1202692cc242c

head               d5011fce325fb0b8497129914cd9f56404c53218

Named refs at pin: 4c59452449c16ba800b5753c21f1202692cc242c ... d5011fce325fb0b8497129914cd9f56404c53218

Read the diff:

git diff --find-renames 4c59452449c16ba800b5753c21f1202692cc242c d5011fce325fb0b8497129914cd9f56404c53218

Commits:
- d5011fc 0.9.0

Sources:
- commit 0.9.0 Release notes for the CLI, UI, and skill changes since 0.8.0.
- pr PR #114 Release PR; CI publishes to npm on merge.
  https://github.com/matemolnar8/comprehende/pull/114

The title:

0.9.0

The why:

[The release commit](source:s1) ships the `review` command, string hunk refs, and diff reading aids that landed on `main` since 0.8.0.

The what (small):

Bumps the package to 0.9.0, pins the next skill to that version, and copies `skills-next/comprehende/` onto the published `skills/comprehende/`.

Look for:
- Breaking: the published skill now runs `review` and writes string hunk refs; neither exists in 0.8.0, so it works only once CI publishes `comprehende@0.9.0` ([release notes](source:s1)).
- Every `npx comprehende@` pin in the three skill copies names 0.9.0, the same as `package.json`.

## Review concerns

### 01 Version and next-skill pin (`version`)

`package.json` moves to 0.9.0 and `pnpm sync:skill` rewrites the `npx comprehende@` pins in `skills-next/` and its `.agents/` copy.

[groups/version.md](groups/version.md)

### 02 Published skill (`published-skill`)

`pnpm release:skill` copies `skills-next/comprehende/` onto `skills/comprehende/`: the `review` workflow, string hunk refs, and the regenerated schema.

Depends on:
- 01 Version and next-skill pin (`version`)

[groups/published-skill.md](groups/published-skill.md)