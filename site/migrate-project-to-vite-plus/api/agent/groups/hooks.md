Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify faffb06a46ff492182596dbb26b16485f45b27a0` and `git rev-parse --verify 5f921bb44fa732555b152da19147990c4e99b664` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames faffb06a46ff492182596dbb26b16485f45b27a0 5f921bb44fa732555b152da19147990c4e99b664 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  faffb06a46ff492182596dbb26b16485f45b27a0

head               5f921bb44fa732555b152da19147990c4e99b664

Named refs at pin: main ... HEAD

Read the diff:

git diff --find-renames faffb06a46ff492182596dbb26b16485f45b27a0 5f921bb44fa732555b152da19147990c4e99b664

Review concern 03 of 05: CI check and staged hook (`hooks`)

Part: toolchain

The why:

This group wires the new checks into automation [Run tests on Vitest, check on CI, staged pre-commit hook](source:s3).

The what:

It adds pnpm exec vp check to CI, adds the .vite-hooks/pre-commit dispatcher running vp staged plus the skill sync check, and trims an unused import in the hook installer.

Depends on:
- 01 Vite+ toolchain config (`toolchain`)

Hunk refs for this concern:
- .github/workflows/ci.yml
- .vite-hooks/pre-commit
- scripts/install-git-hooks.js