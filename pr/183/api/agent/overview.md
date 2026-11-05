Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 4ead77f938f8995fbae6e81f80833d04bac338ed` and `git rev-parse --verify 60446b8a8bd67320a7961211586485443a1c4239` in this repository.
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

head               60446b8a8bd67320a7961211586485443a1c4239

Named refs at pin: 4ead77f938f8995fbae6e81f80833d04bac338ed ... HEAD

Read the diff:

git diff --find-renames 4ead77f938f8995fbae6e81f80833d04bac338ed 60446b8a8bd67320a7961211586485443a1c4239

Commits:
- 60446b8a Eval: snapshot the skill per run, add --repeat, --jobs, --skill, --keep

Sources:
- transcript Claude Code session · Nov 5 Retro of 10 eval sessions: snapshot the skill per run, add --repeat and --skill, share .env and the clone cache across worktrees, fix args help, and rewrite docs/eval.md with debrief, CI artifact, and flaky-expect sections.

The title:

Eval runner: per-run skill snapshot, repeats, shared cache

The why:

Agents that run evals lose 30+ minutes per session, partly from a stale [docs/eval.md](source:s1) and partly from runner gaps such as skill edits that leak into later cases.

The what (medium):

The eval runner snapshots the skill once per run, adds `--repeat`, `--jobs`, `--skill`, and `--keep`, shares one locked clone cache and the main checkout's `.env` across worktrees, and `docs/eval.md` is rewritten to match.

Things to check:
- The task asks for a smoke eval and a `--repeat 2` run as proof. Both ran, but every producer call got Muse error 402 (billing verification failed), so no review was produced and the debrief command was not tried on a real session.
- The task gives `.gitignore` to this change. It is unchanged: `eval/.cache/` stays ignored so old caches in existing checkouts do not show up as untracked files.

## Review concerns

### 01 Skill snapshot per run (`snapshot`)

`snapshotSkill` copies the skill folder once, hashes the copy with a throwaway git index, then rewrites the CLI pin, so the hash matches `HEAD:<skill dir>` for a clean skill.

Attention (contract):
`skillTree` in `summary.json` is now the tree of the copy that ran, not `HEAD:skills-next/comprehende`. With uncommitted skill edits the value names no commit, and `run.ts` prints a warning. Check that nothing compares `skillTree` to a commit tree.

[groups/snapshot.md](groups/snapshot.md)

### 02 Shared clone cache and worktree .env (`cache`)

`checkout.ts` finds the git common dir; `loadDotEnv` reads the worktree `.env` and then the main checkout's, and `cloneCaseFromCache` fills the shared cache under a lock before it hardlink-clones a private bare repo for the case.

Attention (tradeoff):
`withLock` holds the cache entry through the first clone, the fetch, and the hardlink clone. Parallel cases of one repo queue there, so a cold ruff clone blocks every other ruff case until it ends. A lock whose owner pid is dead, or that has no pid after 60 seconds, is taken over.

[groups/cache.md](groups/cache.md)

### 03 Run loop: trials, jobs, keep (`runner`)

`runEval` snapshots the skill once, expands each case into `--repeat` trials, and runs them through `mapPool` with `--jobs` in flight; `caseKey` names each trial `<id>.t<n>` in folders, lines, and the report.

Attention (contract):
With `--repeat 1` (the default) case folders stay `<id>/`, so CI artifacts and `--baseline` keep their paths. A repeated run writes `<id>.t<n>/`, so `--rescore` and `--baseline` on it need the same `--repeat` to find each trial.

Depends on:
- 01 Skill snapshot per run (`snapshot`)
- 02 Shared clone cache and worktree .env (`cache`)

[groups/runner.md](groups/runner.md)

### 04 docs/eval.md (`docs`)

"Long runs" now says to build once before parallel `run.ts` streams and to kill by cwd, and new sections cover debriefing a kept session, CI artifact paths, and known flaky expects.

[groups/docs.md](groups/docs.md)