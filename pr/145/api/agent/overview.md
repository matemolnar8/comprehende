Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 50129928c7b33f461cd5fea07ee77b6ed7237fed` and `git rev-parse --verify 79d7f0b2167dcf8fa0eacf9191c454f9d3cb17f5` in this repository.
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

base (merge-base)  50129928c7b33f461cd5fea07ee77b6ed7237fed

head               79d7f0b2167dcf8fa0eacf9191c454f9d3cb17f5

Named refs at pin: main ... HEAD

Read the diff:

git diff --find-renames 50129928c7b33f461cd5fea07ee77b6ed7237fed 79d7f0b2167dcf8fa0eacf9191c454f9d3cb17f5

Commits:
- 79d7f0b Remove leftover .githooks setup and expire eval artifacts after 7 days

Sources:
- transcript Claude Code session · Oct 21 Máté asks to make pre-commit hooks run again, remove the old .githooks leftovers, and keep eval artifacts for 7 days.

The title:

Remove the old .githooks setup and keep eval artifacts 7 days

The why:

No pre-commit hook ran because `core.hooksPath` still pointed at the deleted `.githooks` folder, and eval artifacts filled the account's Actions storage quota [as the request says](source:s1).

The what (trivial):

Deletes the leftover `.githooks` installer, its test, and a stale comment. Sets `retention-days: 7` on the eval run artifact.

Look for:
- Each existing clone or worktree still needs a one-time local fix: `git config --unset core.hooksPath`, then `vp config --no-agent`. `vp config` skips with exit 0 while `core.hooksPath` holds another value.

## Review concerns

### 01 Old .githooks installer (`githooks-leftovers`)

Deletes the installer, the test that ran it in a linked worktree, and the comment in `exec.ts` that pointed at its copy of `GIT_DIR_VARS`.

[groups/githooks-leftovers.md](groups/githooks-leftovers.md)

### 02 Eval artifact retention (`eval-retention`)

Adds `retention-days: 7` to the `Upload eval run` step. The step still runs on failed runs.

[groups/eval-retention.md](groups/eval-retention.md)