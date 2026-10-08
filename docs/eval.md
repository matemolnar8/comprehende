# Eval

`pnpm eval -- --help` lists every flag. Cases live in `eval/cases/<id>/` (`case.json`, `expected.md`, frozen `sources/`). `eval/review-criteria.md` says how to read `expected.md`.

## Run times

- Smoke (`--tag smoke --no-graders`) takes about 4 minutes.
- A graded case takes 3 to 6 minutes. The full graded suite takes about 40 minutes.

## Long runs

- Start the run in tmux with output going to a log file. Wait with `AwaitShell`. Do not poll with repeated `grep` or `ps` calls.
- A case that fails with `[canceled] This operation was aborted` can end the whole suite (issue #123). Re-run only the cases that did not finish with `--case <id>`. Do not re-run the full suite.
- Each run writes `eval/runs/<stamp>/summary.json`. Read the failed case's `result.json` there for the full error.

## Cursor usage limit

When Cursor reports a usage limit, add `--cursor-fallback`. It needs `MUSE_CODE_API_KEY` and the `muse` CLI. The eval workflow installs both. Locally, install the CLI the way `.github/workflows/eval.yml` does.

## Before reading SDK internals

`@cursor/sdk` ships minified bundles. Check the [SDK docs](https://cursor.com/docs/api/sdk/typescript) and test the cheapest hypothesis first. For example, the SDK finds `rg` on `PATH`, so the fix for the ripgrep log line was an install step in `eval.yml`, not code.
