Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 4ead77f938f8995fbae6e81f80833d04bac338ed` and `git rev-parse --verify 74b258d28d18ca9c8e65e96a4a0b58e060777b36` in this repository.
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

base (merge-base)  4ead77f938f8995fbae6e81f80833d04bac338ed

head               74b258d28d18ca9c8e65e96a4a0b58e060777b36

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 4ead77f938f8995fbae6e81f80833d04bac338ed 74b258d28d18ca9c8e65e96a4a0b58e060777b36

Commits:
- 74b258d2 Agent tooling: Pages publish waits for its deploy, check:changed, worktree setup

The title:

Agent tooling: Pages deploy wait, check:changed, worktree setup

The why:

A retro of 10 agent sessions found agents losing time on Pages 404s after publish, worktrees without node_modules or .env, hand-built vp check file lists, and AGENTS.md pointers that led to wrong files or commands.

The what (small):

The Pages publish script waits for its deploy and reruns a failed one once; a new script checks changed files; worktree setup works without T3; AGENTS.md points agents to the right files and commands.

## Review concerns

### 01 Pages publish waits for its deploy (`pages-wait`)

After the push, publish polls the Actions run whose head SHA is the pushed gh-pages commit, reruns it once on failure, and the skill tells the agent what each deploy state means.

Attention (tradeoff):
`publish` now exits 1 when the deploy does not succeed, although the gh-pages push did. The URL prints before the wait, so callers keep it. Decide if a non-zero exit is the right signal for a pushed but undeployed site.

[groups/pages-wait.md](groups/pages-wait.md)

### 02 pnpm check:changed (`check-changed`)

The new package script runs vp check with --no-error-on-unmatched-pattern on files changed since the merge-base with origin/main plus untracked files.

[groups/check-changed.md](groups/check-changed.md)

### 03 Worktree setup without T3 (`setup-worktree`)

`mainCheckout` reads the first `git worktree list` entry, and the script uses it as the project root when the env var is unset.

Attention (risk):
The script body now runs under `if (import.meta.main)` so the test can import `mainCheckout`. `import.meta.main` exists from Node 24.2; `engines` says `>=24`, so on 24.0 or 24.1 the script would do nothing.

[groups/setup-worktree.md](groups/setup-worktree.md)

### 04 AGENTS.md pointers (`agents-md`)

Each edited line points at the command or file the retro found agents missing: setup-worktree, check:changed, ui:screenshots, src/api, src/review files, the field grep, generate:schema, sync:skill, the local-CLI PR flow, and --cli-login.

[groups/agents-md.md](groups/agents-md.md)