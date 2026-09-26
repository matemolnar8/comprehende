# comprehende-39: Support linked worktrees in Git operations and hooks

PR #39. No ticket, no comments.

## Story

- Title: the PR title.
- Why: present, from the PR title. Comprehende must work when cwd is a linked worktree. Do not add a breakage story that the PR does not tell.
- Size: small or medium.
- Parts: one story. Two are acceptable, with hook install (a dev tool for this repo) as its own part. Groups: 3.

## Groups

1. Drop inherited git dir variables: `src/git/exec.ts`, `src/git/exec.test.ts`, `src/schema/skill-sync.ts`.
2. Common git dir for repo name and LFS: `src/git/repo.ts`, `src/git/lfs.ts`, `src/git/repo.test.ts`, `src/git/worktree.test.ts`.
3. Hooks through `core.hooksPath`: `scripts/install-git-hooks.js`, `src/git/hooks.test.ts`.

No `dependsOn` from groups 2 or 3 to group 1. The hook script has its own copy of the variable list and does not use `gitEnv`.

## Must state

- The PR lists "Pin package and skill references to version 0.5.2". No hunk changes a version.

## Good to state

- `--path-format=absolute` needs Git 2.31 or later. On older Git, `gitCommonDir` fails, and so do repo naming without an origin and LFS reads.
- Without an origin, the repo name is now the parent folder of the common git dir. That is wrong when the common dir is not `<repo>/.git`, for example a bare repository or a submodule.
- `core.hooksPath` makes Git ignore `.git/hooks`. Other hooks there, such as Git LFS hooks, stop running.

## Must not

- Do not make a group per test file.
- Do not tag the intended worktree naming change as Breaking. The test asserts it.

## Baseline

- 6 of 6 runs stated the 0.5.2 claim.
- Runs made 4 to 7 groups, most with one group per test file.
- In 4 of 6 runs the grader found a major false `dependsOn` from the common dir or hook groups to the git env group.

## case.json

- `parts` max 3 to 2.
- `together`: each test with its code (`exec.ts` with `exec.test.ts`, the hook script with `hooks.test.ts`).
- `apart`: the hook script and `repo.ts`.
- Added the 0.5.2 claim.
