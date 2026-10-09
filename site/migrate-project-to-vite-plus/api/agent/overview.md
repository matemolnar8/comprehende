Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify faffb06a46ff492182596dbb26b16485f45b27a0` and `git rev-parse --verify 5f921bb44fa732555b152da19147990c4e99b664` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  faffb06a46ff492182596dbb26b16485f45b27a0

head               5f921bb44fa732555b152da19147990c4e99b664

Named refs at pin: main ... HEAD

Read the diff:

git diff --find-renames faffb06a46ff492182596dbb26b16485f45b27a0 5f921bb44fa732555b152da19147990c4e99b664

Commits:
- 5f921bb Resolve all vp check warnings
- f774aa2 Run tests on Vitest, check on CI, staged pre-commit hook
- eb8e200 Delete outdated docs
- 95eead4 Migrate to Vite+ 1.1.0

Sources:
- commit Migrate to Vite+ 1.1.0 Adopts the vite-plus toolchain with catalog pins, vp scripts, fmt and lint blocks, and fixes surfaced type errors.
- commit Delete outdated docs Removes docs that no longer match the product.
- commit Run tests on Vitest, check on CI, staged pre-commit hook Moves the suite to vite-plus/test, runs vp check in CI, and switches hooks to the Vite+ dispatcher.
- commit Resolve all vp check warnings Clears the remaining vp check warnings, including a receiver bind and scoped disables.

The title:

Migrate to Vite+ 1.1.0

The what (medium):

The branch moves the repo to the Vite+ 1.1.0 toolchain with Vitest, vp check in CI, and the Vite+ staged hook. It also clears type-aware lint warnings and deletes outdated docs.

## Review concerns

### 01 Vite+ toolchain config (`toolchain`)

It pins vite and vite-plus through the catalog, defines fmt, lint, test, and staged blocks in vite.config.ts, and updates package scripts, the node version file, the UI tsconfig, and the install script.

[groups/toolchain.md](groups/toolchain.md)

### 02 Vitest test harness (`vitest`)

It rewrites test imports to vite-plus/test, renames after to afterAll, and reformats suites with vp fmt, with helpers and eval cases kept alongside.

Depends on:
- 01 Vite+ toolchain config (`toolchain`)

[groups/vitest.md](groups/vitest.md)

### 03 CI check and staged hook (`hooks`)

It adds pnpm exec vp check to CI, adds the .vite-hooks/pre-commit dispatcher running vp staged plus the skill sync check, and trims an unused import in the hook installer.

Depends on:
- 01 Vite+ toolchain config (`toolchain`)

[groups/hooks.md](groups/hooks.md)

### 04 Lint and format sweep (`lint`)

It applies vp fmt across source, scripts, and UI and fixes the type errors type-aware lint reports; the reader can skip pure reformatting and spot-check the type fixes.

Depends on:
- 01 Vite+ toolchain config (`toolchain`)

[groups/lint.md](groups/lint.md)

### 05 Docs and skill copies (`docs`)

It deletes PLAN.md and docs/token-efficiency.md, trims docs/glossary.md, and syncs the comprehende and unslop skill copies.

[groups/docs.md](groups/docs.md)