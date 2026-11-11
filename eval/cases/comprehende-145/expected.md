# comprehende-145: Remove old .githooks leftovers and keep eval artifacts 7 days

PR #145. No ticket, no comments. Two unrelated changes in one PR: dead git-hook installer code is deleted, and the eval workflow keeps its run artifacts for 7 days.

## Story

- Title: the PR title.
- Why: absent at document level, because the two stories are unrelated and no source unifies them. Each group `why` can carry its own PR-body reason: no pre-commit hook ran since the move to `.vite-hooks`, and eval artifacts filled the Actions storage quota.
- Size: trivial or small. One deleted script and its test, one deleted comment, and one workflow line.
- Parts: two. The PR body says "Separately"; either change could have been its own PR.
- Groups: 2. A third is fine when the `exec.ts` comment sits apart.

## Groups

1. Old hook installer removal: `scripts/install-git-hooks.js`, `src/git/hooks.test.ts`, `src/git/exec.ts`. The deleted installer, the test that checked it, and the comment that pointed at it.
2. Eval artifact retention: `.github/workflows/eval.yml`. One added `retention-days: 7` line on the upload step.

## Must

- The merge does not fix the skipped pre-commit hook: the PR body says each clone that still has `core.hooksPath = .githooks` needs a one-time local `git config --unset core.hooksPath && vp config --no-agent`, and no hunk does that.
- The `Upload eval run` step in `.github/workflows/eval.yml` now sets `retention-days: 7`, so eval artifacts expire after 7 days instead of the GitHub default.

## Good

- The PR deletes `scripts/install-git-hooks.js`, its test `src/git/hooks.test.ts`, and the `exec.ts` comment that said `GIT_DIR_VARS` is mirrored in that script.
- Nothing ran `scripts/install-git-hooks.js` before this PR, because `prepare` in `package.json` already ran `vp config --no-agent`, so the deletion has no runtime effect.

## Must not

- Do not say the merge makes the pre-commit hook run again.

## Notes

- This case checks that two unrelated changes become two parts. `parts` is exactly 2, `partsApart` keeps the workflow line apart from the installer, and `partsTogether` keeps the three hook files in one part.
- The manual `git config` fix is `Must` because the PR body alone shows that the merge does not fix the stated problem. The dead-code fact is `Good` because it needs a read of `package.json` outside the diff.
