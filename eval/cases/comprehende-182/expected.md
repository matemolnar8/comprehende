# comprehende-182: Agent tooling: Pages publish waits for its deploy, plus check:changed and worktree setup

PR #182. No ticket, one conversation comment. Three independent tooling fixes from one retro, plus AGENTS.md pointer updates.

## Story

- Title: the PR title.
- Why: present. The PR body says a retro of 10 agent sessions found agents losing time on these tooling gaps.
- Size: small or medium.
- Parts: three or four. The Pages deploy wait, `check:changed`, and the worktree setup change could each have been its own PR. The AGENTS.md pointer updates can be a fourth part or sit with the story each hunk serves.
- Groups: 3 to 6.

## Groups

1. Pages publish waits for its deploy: `scripts/pages-review.ts`, `scripts/pages-review.test.ts`, `.agents/skills/pages/SKILL.md`.
2. `check:changed` script: `scripts/check-changed.ts`, `package.json`.
3. Worktree setup outside T3: `scripts/setup-worktree.ts`, `scripts/setup-worktree.test.ts`, `CONTRIBUTING.md`. The only `CONTRIBUTING.md` hunk documents the setup fallback.
4. AGENTS.md pointers, alone or with the stories they name.

## Must

- `scripts/pages-review.ts publish` now waits for the Pages deploy of the pushed `gh-pages` commit and reruns it once when it fails.
- `publish` now exits 1 unless the deploy ends in success, also when no Pages run appears, while at base it exited 0 after the push.
- `pnpm check:changed` runs `vp check --no-error-on-unmatched-pattern` on files changed against the merge-base with `origin/main`, plus untracked files.
- Without `T3CODE_PROJECT_ROOT`, `scripts/setup-worktree.ts` now uses the main checkout as its project root instead of throwing.

## Good

- `scripts/setup-worktree.ts` now runs its install and `.env` linking only under `import.meta.main`, so the test can import `mainCheckout` without running `vp i`.

## Must not

## Notes

- The PR body does not say that `publish` now fails when the deploy fails, times out after 10 minutes, or never appears (`scripts/pages-review.ts:625`). That is why it is a Must.
- `case.json` `partsApart` checks that the Pages wait, `check:changed`, and the worktree setup are separate parts, even though one PR body motivates them all.
