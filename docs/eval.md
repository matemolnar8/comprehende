# Eval

`pnpm eval -- --help` lists every flag. Cases live in `eval/cases/<id>/` (`case.json`, `expected.md`, frozen `sources/`). `eval/review-criteria.md` says how to read and write `expected.md`.

Producer and grader run in Muse Code (`muse exec`). Both default to `muse-spark-1.3-contributor`. Override with `--producer-model` or `--grader-model`.

## What decides pass or fail

Only `validate` and the `case.json` expects (why, parts, groups, size, source kinds, mechanical paths, together, apart) change the exit code. The grader is one read-only call per case. It gets the review, the diff of every group, the frozen sources, and the `Must`, `Good`, and `Must not` lists from `expected.md`. It answers yes or no per item with a quote, and marks each `lookFor` bullet the review wrote as true or false at head. The case line shows `must 3/4  good 1/2  mustNot 0/3  bullets 2/2 true`. A false bullet is the costly error: the review told the reader something that is not so.

The grader does not judge grouping or prose quality. Grouping is checked by `together` and `apart`. Prose is linted: em dashes, sentences over 25 words, summaries with more sentences than the skill allows, and summaries that read as a path list. Lints print on the case line and in the report and do not fail the case.

`--rescore <dir>` reruns the checks and the grader on the reviews saved in `eval/runs/<stamp>`. Use it to try a rubric or a grader prompt without paying for new producer runs. Add `--no-graders` to rerun only the checks, with no API key.

## Run times

- Smoke (`--tag smoke --no-graders`) takes about 4 minutes.
- A graded case takes 3 to 6 minutes. The full graded suite takes about 40 minutes.

## Long runs

- Start the run in tmux with output going to a log file. Wait with `AwaitShell`. Do not poll with repeated `grep` or `ps` calls.
- Run one eval process at a time. Parallel runs share one `node_modules` and race `pnpm` and the shared esbuild store.
- A failed producer retries once when it wrote no `review.json`. Validate and size failures do not retry. The grader retries only when the model returned text that is not the expected JSON, so a stall does not spend another full timeout.
- Each run writes `eval/runs/<stamp>/summary.json`. Read the failed case's `result.json` there for the full error. Producer failures also print to stderr as soon as the producer returns, before the graders finish.

## Muse setup

Runs need `MUSE_CODE_API_KEY`, or pass `--cli-login` to use the `muse` CLI login instead. The `muse` CLI must be on `PATH`. The eval workflow installs it. Locally, install the CLI the way `.github/workflows/eval.yml` does.
