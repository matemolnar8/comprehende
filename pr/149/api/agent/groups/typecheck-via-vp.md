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

Review concern 02 of 03: Type checks and docs use the vp toolchain (`typecheck-via-vp`)

The why:

`vp check` already type-checks every file in its tsconfig project, so the `tsc` chain only repeated it ([session](source:s1)).

The what:

`pnpm typecheck` becomes `vp check --no-fmt --no-lint`, CI drops the `vp run typecheck` step that followed `vp check`, and `AGENTS.md`, `.cursor/BUGBOT.md`, and `README.md` name `vp check` and `vp test` in place of `pnpm typecheck` and `pnpm test`.

Look for:
- `typecheck` now reports errors from every project in one pass. The old `tsc` chain stopped at the first project that failed.
- `vp check` on Markdown files alone exits 1 with "No files found to lint". The pre-commit hook still passes for a Markdown-only commit.

Depends on:
- 01 UI tests get their own TypeScript project (`test-project`)

Hunk refs for this concern:
- package.json
- .github/workflows/ci.yml
- AGENTS.md
- .cursor/BUGBOT.md
- README.md