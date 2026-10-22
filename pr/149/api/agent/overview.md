Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 2ef0a645c3de4340edc92ab04a1519a7801252ef` and `git rev-parse --verify b594a7c6ac4cfd391229272daf9b7b0ff53e5fa6` in this repository.
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

base (merge-base)  2ef0a645c3de4340edc92ab04a1519a7801252ef

head               b594a7c6ac4cfd391229272daf9b7b0ff53e5fa6

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 2ef0a645c3de4340edc92ab04a1519a7801252ef b594a7c6ac4cfd391229272daf9b7b0ff53e5fa6

Commits:
- b594a7c Give UI tests their own tsconfig so staged checks find node types
- 2ef0a64 Merge pull request #148 from matemolnar8/t3/trim-npm-readme
- 2d9a156 Move developer docs out of the README

Sources:
- transcript Claude Code session · Oct 22 Máté reports that `vp staged` fails on UI tests that import `node:assert`, and asks for the root cause and the smallest fix that does not weaken the check.

The title:

Give UI tests their own tsconfig so staged checks find node types

The why:

A commit that stages a UI test fails the pre-commit hook with TS2591 on `node:assert/strict`, while the full `vp check` passes ([session](source:s1)).

The what (small):

`src/ui/tsconfig.json` becomes a solution file that references `tsconfig.app.json` (the old UI config) and a new `tsconfig.test.json` that adds node types for UI tests. `pnpm typecheck` checks both projects.

## Review concerns

### 01 UI tests get their own TypeScript project (`test-project`)

The solution `tsconfig.json` points tsgolint and editors at the app and test projects. The test project extends the app options and adds `node` to `types`. `typecheck` runs `tsc` on each project.

[groups/test-project.md](groups/test-project.md)

### 02 Old UI config moves to tsconfig.app.json (`mechanical`)

A pure rename with no content change. You can skip it.

[groups/mechanical.md](groups/mechanical.md)