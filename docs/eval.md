# Eval

`pnpm eval -- --help` lists every flag. Cases live in `eval/cases/<id>/` (`case.json`, `expected.md`, frozen `sources/`). `eval/review-criteria.md` says how to read and write `expected.md`.

Producer and grader run in Muse Code (`muse exec`). The producer defaults to `muse-spark-1.3-contributor`; the grader defaults to `muse-ember-1.0`. Override with `--producer-model` or `--grader-model`.

Muse Ember (`muse-ember-1.0`) grades by default because repeated rescore checks put it at parity for less time. It has no contributor variant, so the harness passes `--contributor-mode off` for it; with the mode on it fails with "does not exist or you lack access". Across five runs each on `comprehende-50` and `comprehende-57`, Ember-vs-Spark verdict agreement (median 50 of 52) overlapped Spark-vs-Spark (51 of 52), grader tokens matched at the median, no run failed to parse, and Ember graded about 3.7 times faster. The producer stays on Spark contributor: Ember spot checks wrote thinner reviews, and on the Model API Ember output costs $0.50 per 1M tokens against Spark contributor $0.20 (input $0.10 both; Ember bills the whole request at $0.30 input and $1.50 output over 200K input tokens).

A `claude-*` producer model (for example `--producer-model claude-sonnet-5-5 --producer-effort high`) runs the producer in Claude Code (`claude -p`) with the `claude` CLI login only; API key variables are removed from its environment. Use it to compare Claude models. The grader stays in Muse. With `--keep`, resume a Claude producer with `claude --resume <sessionId>` from its clone.

A `cursor/<model>` producer model (for example `--producer-model cursor/gpt-5.5`) runs the producer in the Cursor CLI (`cursor-agent -p`) with the `cursor-agent login` only; `CURSOR_API_KEY` and `CURSOR_AUTH_TOKEN` are removed from its environment. The part after `cursor/` goes to `--model` as written, so model params go there too (`cursor/claude-opus-4-8[effort=high]`), and `--producer-effort` is an error. Cursor reports tokens but no cost or reasoning tokens. Cursor keeps every chat, so resume a producer with `cursor-agent --resume <sessionId>` from its clone.

## What decides pass or fail

Only `validate` and the `case.json` expects (why, parts, groups, size, source kinds, mechanical paths, together, apart) change the exit code. The grader is one read-only call per case. It gets the review, the diff of every group, the frozen sources, and the `Must`, `Good`, and `Must not` lists from `expected.md`. It answers yes or no per item with a quote, and marks each document `lookFor` bullet, group `attention` note, focus caption, line note, and file note the review wrote as true or false at head. The case line shows `must 3/4  good 1/2  mustNot 0/3  bullets 2/2 true`. A false bullet is the costly error: the review told the reader something that is not so.

The grader does not judge grouping or prose quality. Grouping is checked by `together` and `apart`. Prose is linted: em dashes, sentences over 25 words, summaries with more sentences than the skill allows, and summaries that read as a path list. Lints print on the case line and in the report and do not fail the case.

The case line and the run total print `words`: the prose a review writes for the reader. Titles, summaries, whys, `lookFor`, attentions, questions, captions, notes, file notes, and source gists count. A copied PR comment body does not. Each run also prints `words a->b` per case under `--baseline`.

## Comparing two skills

One run of a skill does not measure it. The same skill scored `must` 30 and 39 in two trials, and CI runs scored higher than local runs of the same skill. Run both skills side by side from the same machine, with `--repeat 3` and `--skill <dir>` for the old one, and compare totals across the trials. A fact a review loses to a tight length costs `must`, so read the lost items before you tighten the skill's usual lengths.

`--rescore <dir>` reruns the checks and the grader on the reviews saved in `eval/runs/<stamp>`. Use it to try a rubric or a grader prompt without paying for new producer runs. Add `--no-graders` to rerun only the checks, with no API key.

## Run times

- Smoke (`--tag smoke --no-graders`) takes about 4 minutes.
- A graded case takes 3 to 10 minutes, and `vitadeck-144` about 13. The full graded suite takes about 85 minutes with one job. CI runs it with `--jobs 2` to stay under an hour. Before you add a case, drop one that checks the same thing, or the suite outgrows that hour.

## Long runs

- Run the eval in the background with output going to a log file. Arm one wake-up for when the process exits, and do not poll the log or `ps`.
- `pnpm eval` runs `pnpm build` first, and two builds at once race on `dist/`. For parallel streams, run `pnpm build` once, then start `tsx scripts/eval/run.ts --case <id>` per stream. `run.ts` does not build, so after a code change it runs the old `dist/` until you build again. `--jobs <n>` runs n cases in one process instead.
- To stop a run, kill only the processes whose cwd is your checkout, for example `pgrep -f scripts/eval/run.ts` and then `lsof -a -d cwd -p <pid>` for each pid. A broad `pkill` also stops evals in sibling worktrees.
- Clones of case repos are cached in `comprehende-eval-cache/` under `git rev-parse --git-common-dir`, so all worktrees share one cache. A lock lets parallel runs fill it safely. Each case then gets its own clone in the temp dir.
- A failed producer retries once when it wrote no `review.json`. Validate and size failures do not retry. The grader retries only when the model returned text that is not the expected JSON, so a stall does not spend another full timeout.
- Each run writes `eval/runs/<stamp>/summary.json`. Read the failed case's `result.json` there for the full error. Producer failures also print to stderr as soon as the producer returns, before the graders finish.
- The run copies the skill to `eval/runs/<stamp>/skill/` at the start, and every case uses that copy. You can edit the skill while a run goes. `skillTree` in `summary.json` is the tree of that copy, so it differs from `HEAD` when the skill has uncommitted edits.

## Debrief a failing case

Run the case with `--keep`, so its clone stays on disk. Then, from the case's `result.json`, take `clone` (the producer's cwd) and `producer.sessionId`, and resume the session from that cwd:

```sh
cd <clone> && muse exec --session-id <sessionId> --disable-write --disable-shell --json "<question>"
```

`--repeat <n>` with `--keep` gives n sessions to compare. Delete the kept clones in your temp dir when you are done.

## CI artifacts

The eval workflow uploads `eval/runs` as the artifact `eval-run`. `gh run download <run id> -D <dir>` puts each case at `<dir>/eval-run/<stamp>/<case>/`, or `<case>.t<n>/` for trial n of a `--repeat` run. Each case folder has `result.json`, plus `review.json`, `producer.md`, `packet.md`, `rubric.json`, and `site/` when that step ran. `scripts/eval/result.ts` defines the shape of `result.json` and `summary.json`.

## Known flaky expects

`comprehende-57` `size` comes out `small` in about 1 of 9 runs, and `cigster-99` `parts` sometimes falls outside its range. `cigster-99` `apart` and `comprehende-59` `together` also fail now and then, and about 2 to 3 percent of case runs fail some expect. Check the result against `case.json` before you call it a regression, and use `--repeat` to measure the rate.

## Muse setup

Runs use the `muse` CLI login (`muse login`), which spends the subscription, by default — even when `MUSE_CODE_API_KEY` is set. `--use-api-key` spends that key (pay as you go) instead. `--cli-login` names the default and wins over `--use-api-key`. CI writes the repo secret `MUSE_AUTH_JSON` (a CI-only device login, not your daily one) to `~/.config/muse/auth.json` and checks it with `muse usage`; only a missing secret falls back to `--use-api-key` with `MUSE_CODE_API_KEY` — a failed check keeps the subscription so a dead login fails visibly instead of silently spending API credit. Refresh an expired CI login by running `muse login` once in any Linux environment with a fresh `HOME` (a container works), then `gh secret set MUSE_AUTH_JSON < ~/.config/muse/auth.json`. Every Muse run resolves a bare `muse-spark-<version>` id to its `-contributor` tier and passes `--contributor-mode on` for that tier and for `muse-wonder` ids, which Muse Code offers in either mode; other ids, such as `muse-spark-1.3-turbo` and `muse-ember-1.0`, stay unchanged and get `--contributor-mode off`, because they have no contributor variant. The `muse` CLI must be on `PATH`. The eval workflow installs it. Locally, install the CLI the way `.github/workflows/eval.yml` does.
