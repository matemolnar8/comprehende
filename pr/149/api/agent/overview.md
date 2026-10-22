Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 36118c1676746e323b265ebc0ebdebb7db1c88e2` and `git rev-parse --verify b4c1ba2871ee5a36e4ba71f77ec63a535ea67317` in this repository.
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

base (merge-base)  36118c1676746e323b265ebc0ebdebb7db1c88e2

head               b4c1ba2871ee5a36e4ba71f77ec63a535ea67317

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 36118c1676746e323b265ebc0ebdebb7db1c88e2 b4c1ba2871ee5a36e4ba71f77ec63a535ea67317

Commits:
- b4c1ba2 Point agent and Bugbot docs at vp check and vp test
- ff6d7f1 Run typecheck through vp check, drop the duplicate CI step
- 36118c1 Merge pull request #147 from matemolnar8/t3/issue-72-non-obtrusive-ux
- b594a7c Give UI tests their own tsconfig so staged checks find node types
- 92f83f0 Merge remote-tracking branch 'origin/main' into t3/issue-72-non-obtrusive-ux
- 2ef0a64 Merge pull request #148 from matemolnar8/t3/trim-npm-readme
- 2d9a156 Move developer docs out of the README
- d86dd95 Add a What changed page that compares a refreshed review with the previous one

Sources:
- transcript Claude Code session · Oct 22 Máté reports that `vp staged` fails on UI tests that import `node:assert`, and asks for the root cause and the smallest fix that does not weaken the check.

The title:

Give UI tests their own tsconfig so staged checks find node types

The why:

A commit that stages a UI test fails the pre-commit hook with TS2591 on `node:assert/strict`, while the full `vp check` passes ([session](source:s1)).

The what (small):

`src/ui/tsconfig.json` becomes a solution file that references `tsconfig.app.json` (the old UI config) and a new `tsconfig.test.json` that adds node types for UI tests. `pnpm typecheck` becomes `vp check --no-fmt --no-lint`, CI drops its duplicate type-check step, and `AGENTS.md` and `.cursor/BUGBOT.md` name `vp check` and `vp test`.

## Review concerns

### 01 UI tests get their own TypeScript project (`test-project`)

The solution `tsconfig.json` points tsgolint and editors at the app and test projects. The test project extends the app options and adds `node` to `types`.

[groups/test-project.md](groups/test-project.md)

### 02 Type checks and docs use the vp toolchain (`typecheck-via-vp`)

`pnpm typecheck` becomes `vp check --no-fmt --no-lint`, CI drops the `vp run typecheck` step that followed `vp check`, and `AGENTS.md` and `.cursor/BUGBOT.md` name `vp check` and `vp test` in place of `pnpm typecheck` and `pnpm test`.

Depends on:
- 01 UI tests get their own TypeScript project (`test-project`)

[groups/typecheck-via-vp.md](groups/typecheck-via-vp.md)

### 03 Old UI config moves to tsconfig.app.json (`mechanical`)

A pure rename with no content change. You can skip it.

[groups/mechanical.md](groups/mechanical.md)