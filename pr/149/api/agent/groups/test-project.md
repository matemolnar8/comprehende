Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 36118c1676746e323b265ebc0ebdebb7db1c88e2` and `git rev-parse --verify 1386f170249935873c781b3dbd4e1e32db3df2bc` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 36118c1676746e323b265ebc0ebdebb7db1c88e2 1386f170249935873c781b3dbd4e1e32db3df2bc -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  36118c1676746e323b265ebc0ebdebb7db1c88e2

head               1386f170249935873c781b3dbd4e1e32db3df2bc

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 36118c1676746e323b265ebc0ebdebb7db1c88e2 1386f170249935873c781b3dbd4e1e32db3df2bc

Review concern 01 of 03: UI tests get their own TypeScript project (`test-project`)

The why:

No tsconfig included UI tests, so tsgolint put them in an inferred program. That program got `@types/node` only when `vite.config.ts` was in the same run ([session](source:s1)).

The what:

The solution `tsconfig.json` points tsgolint and editors at the app and test projects. The test project extends the app options and adds `node` to `types`.

Look for:
- Subtle: `tsc --noEmit -p src/ui/tsconfig.json` now checks no files and exits 0, because the solution file has `files: []`. Point `tsc` at `tsconfig.app.json` or `tsconfig.test.json`.
- UI tests now get the UI options, such as `noUncheckedIndexedAccess`. Before this change, the inferred program did not apply them, so a new UI test can fail where it passed before.

Hunk refs for this concern:
- src/ui/tsconfig.json
- src/ui/tsconfig.test.json