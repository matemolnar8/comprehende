# Eval

`pnpm eval -- --help` lists every flag. Cases live in `eval/cases/<id>/` (`case.json`, `expected.md`, frozen `sources/`). `eval/review-criteria.md` says how to read `expected.md`.

Producer and graders run in Muse Code (`muse exec`). Both default to `muse-spark-1.3-contributor`. Override with `--producer-model` or `--grader-model`.

## Run times

- Smoke (`--tag smoke --no-graders`) takes about 4 minutes.
- A graded case takes 3 to 6 minutes. The full graded suite takes about 40 minutes.

## Long runs

- Start the run in tmux with output going to a log file. Wait with `AwaitShell`. Do not poll with repeated `grep` or `ps` calls.
- A case that fails with `[canceled] This operation was aborted` can end the whole suite (issue #123). Re-run only the cases that did not finish with `--case <id>`. Do not re-run the full suite.
- Each run writes `eval/runs/<stamp>/summary.json`. Read the failed case's `result.json` there for the full error.

## Muse setup

Runs need `MUSE_CODE_API_KEY`, or pass `--cli-login` to use the `muse` CLI login instead. The `muse` CLI must be on `PATH`. The eval workflow installs it. Locally, install the CLI the way `.github/workflows/eval.yml` does.
