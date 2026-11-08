# comprehende-145: Remove old .githooks leftovers and keep eval artifacts 7 days

PR #145. No ticket, no comments. Two unrelated changes in one PR: dead git-hook installer code is deleted, and the eval workflow keeps its run artifacts for 7 days.

## Story

- Title: the PR title.
- Why: present. The PR body gives a reason for each story: no pre-commit hook ran since the move to `.vite-hooks`, and eval artifacts filled the Actions storage quota.
- Size: trivial or small. One deleted script and its test, one deleted comment, and one workflow line.
- Parts: two. The PR body says "Separately"; either change could have been its own PR.
- Groups: 2. A third is fine when the `exec.ts` comment sits apart.

## Groups

1. Old hook installer removal: `scripts/install-git-hooks.js`, `src/git/hooks.test.ts`, `src/git/exec.ts`. The deleted installer, the test that checked it, and the comment that pointed at it.
2. Eval artifact retention: `.github/workflows/eval.yml`. One added `retention-days: 7` line on the upload step.

## Must

- The `Upload eval run` step in `.github/workflows/eval.yml` now sets `retention-days: 7`, so eval artifacts expire after 7 days instead of the GitHub default.
- The PR deletes `scripts/install-git-hooks.js` and `src/git/hooks.test.ts`, and removes the `exec.ts` comment that said `GIT_DIR_VARS` is mirrored in that script.
- The hook removal and the retention change are two parts, each with its own `parts[]` entry.

## Good

- The diff does not change how hooks are installed; the PR body says vite-plus `prepare` already sets `core.hooksPath`, and only clones with the old `.githooks` value need a one-time local fix.

## Must not

- Do not put the workflow line and the hook removal in one group or one part.
- Do not add a `dependsOn` between the two groups.
- Do not say the PR changes hook installation code; it only deletes the old installer.

## Notes

- This case checks that two unrelated changes become two parts. `parts` is exactly 2.
