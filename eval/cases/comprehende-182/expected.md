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
3. Worktree setup outside T3: `scripts/setup-worktree.ts`, `scripts/setup-worktree.test.ts`.
4. AGENTS.md and CONTRIBUTING.md pointers, alone or with the stories they name.

## Must

- `scripts/pages-review.ts publish` now waits for the Pages deploy run of the pushed `gh-pages` commit, reruns it once when it fails, and `--no-wait` skips the wait.
- `pnpm check:changed` runs `vp check --no-error-on-unmatched-pattern` on files changed against the merge-base with `origin/main`, plus untracked files.
- Without `T3CODE_PROJECT_ROOT`, `scripts/setup-worktree.ts` links `.env` from the main checkout, the first `git worktree list` entry.
- The Pages wait, `check:changed`, and the worktree setup change are separate parts, each with its own `parts[]` entry.

## Good

- `check:changed` passes extra flags such as `--fix` through to `vp check`.

## Must not

- Do not put the three tooling changes in one part.
- Do not add a `dependsOn` across the three tooling stories.

## Notes

- This case checks that three fixes from one retro become separate parts, even though one PR body motivates them all.
