# Token efficiency report

Where the tokens go when the skill writes a review, and what to change so it uses fewer of them and fewer round trips. Functionality stays the same: same review document, same UI, same `validate` rules.

## Method

- Instrumented the eval producer with the Cursor SDK stream (`run.stream()`): every tool call, per-run usage split into input, cache read, and output. Same prompt, same 7 eval cases, same model (`composer-2.5`) as `pnpm eval`. Script lived outside the repo.
- Two baseline runs with `skills-next/comprehende` as it is. Two runs with a skill-only variant (section 3). Static token counts use the `o200k_base` tokenizer.
- Independent reference: CI run [35552579760](https://github.com/matemolnar8/comprehende/actions/runs/35552579760) (`eval-run` artifact), used for hunk-ref share and grader cost.
- Caveats. `composer-2.5` is not deterministic: the same case varied 1.6x to 3x between runs, so read per-case numbers as a range and totals as the signal. Wall time depended on backend load more than on the skill (one 15-tool run took 256 s, another 29 s), so time is reported as LLM round trips ("steps"), not seconds. `totalTokens` is input + cache read + output, summed over every step, which is why one run is hundreds of thousands of tokens.

## 1. Where the tokens go

Baseline, 7 cases, mean of 2 runs.

| Measure | Value |
| --- | --- |
| Tokens per run of 7 cases | 4.51M (runs: 5.56M, 3.47M) |
| Output tokens | 48.6k, about 1% of the total |
| Context re-sent per step (input + cache read) | 47k average |
| Steps per case | 8 to 29 |
| Tool calls per case | 16 to 52 |
| Per-case range | 212k to 2,062k (9.7x) |
| `validate` green at the end | 13 of 14 |

Almost every token is context sent again on the next step. The two levers are the number of steps and the size of what sits in context. Output tokens are the third lever; they are few, but they are the slow ones.

### Fixed load the agent reads every run

| File | Tokens |
| --- | --- |
| `SKILL.md` | 3,122 |
| `references/review.schema.json` | 1,937 |
| `references/example.md` | 1,053 |
| Total, then re-sent on every later step | 6,112 |

The schema was read in all 14 runs, more than once in 2 of them. The example already shows every field.

### The skeleton and the hunk refs

`comprehende review` writes one hunk ref as 7 pretty-printed lines, about 50 tokens. The agent reads it, then writes every ref back.

| Case | Hunks | Files | Skeleton read | Hunk refs in the written `review.json` |
| --- | --- | --- | --- | --- |
| comprehende-39 | 15 | 9 | 932 tok | 793 tok (30%) |
| comprehende-47 | 109 | 38 | 5,509 tok, read twice | 5,372 tok (70%) |
| comprehende-50 | 5 | 3 | 469 tok | 269 tok (26%) |
| comprehende-57 | 44 | 11 | 2,409 tok | 2,275 tok (57%) |
| comprehende-59 | 34 | 18 | 1,874 tok | 1,735 tok (40%) |
| comprehende-67 | 8 | 8 | 594 tok | 423 tok (12%) |
| vitadeck-24 | 8 | 6 | 580 tok | 418 tok (24%) |
| Total | 223 | 93 | 12,367 tok | 11,285 tok (46% of 24,534) |

In 42 of 46 groups across the 7 reviews, a group holds every hunk of each file it names. Splitting a file between groups happened 4 times.

On the 109-hunk case, in 3 of 3 runs the agent gave up copying refs by hand and wrote a Node script that regroups the skeleton refs by path. In one run the script took 4 attempts (`coverage: 102 hunk(s) are not referenced`), 29 steps and 2.06M tokens.

### Tool calls by purpose (baseline, 2 runs, 7 cases each)

| Purpose | Calls | Steps | What it was |
| --- | --- | --- | --- |
| Looking for the CLI | 94 | 73 | `glob **/*`, `ls dist`, `grep dist`, reading `package.json`, reading `dist/*.js` to learn what `validate` checks |
| Diff | 48 | 43 | `git diff --stat`, `git diff`, per-file diffs, re-reading a spilled diff in 3 chunks |
| Instructions | 45 | 39 | `SKILL.md`, schema, example |
| Exploring the repo | 41 | 30 | reading changed files for the summaries; grepping for a `skipped` field that the document does not have |
| Sources | 44 | 14 | PR, issue, comments |
| Skeleton | 16 | 16 | reading `review.json` |
| Write | 19 | 18 | `edit` of `review.json`; each `edit` result echoes a 3k to 6k token diff back into context |
| Validate | 22 | 22 | 1 to 4 per case |

"Looking for the CLI" is caused by the eval prompt sentence "The CLI named in the skill is the local build", which makes the agent verify the path. It is eval overhead, not user overhead, and it is the largest single bucket (section 4). In one run it made the agent build the reviewed repo's own, older CLI and use that; `validate` failed on `parts`.

The `skipped` hunt is a skill bug: "Lockfiles stay in `skipped`" names a field of the index, and the agent looks for it in the document.

Lockfiles: case 59's `pnpm-lock.yaml` is 5,761 of 16,078 diff tokens (36%). The agent excluded it by hand in these runs; nothing guarantees that.

## 2. Proposals

Ordered by expected saving. Numbers are measured unless marked estimate.

### A. Refs by file, hunk refs only when a file splits

Let a `hunkRefs` entry be a path string (every live hunk of that file), or `path@oldStart+newStart` for one hunk (`old -> new@...` when renamed). The object form stays valid. `hunkKey` already ignores `oldLines` and `newLines`, so nothing is lost. Coverage, stale detection, and the UI work on the same live hunks as today; parse expands the strings at the boundary.

Measured on the 7 CI reviews:

| | Today | File refs plus compact hunk refs |
| --- | --- | --- |
| `review.json` the agent writes | 24,534 tok | 14,547 tok (-40%) |
| 109-hunk case | 7,633 tok | 2,708 tok (-64%) |
| Skeleton the agent reads | 12,367 tok | 2,366 tok (-80%) |
| Entries to copy, 109-hunk case | 109 | 38 |

Not measured, expected: no more regrouping scripts and their validate loops on large diffs (the 2.06M run), and a file ref stays valid after a rebase that only shifts line numbers.

Blast radius: `src/schema/review.ts` (union plus normalize), `src/review/coverage.ts` (expand a path to its live hunks), `src/review/skeleton.ts` (paths, not hunks), `src/schema/identity.ts` (format), the skill's hunk-identity paragraph and example. UI untouched. The agent-facing schema JSON changes with it.

### B. `review` prints the covering diff

Print `git diff --stat` and the unified diff (same options as `serve`: `-U3`, renames, lockfiles left out, images and binaries as one line) to stdout after writing the skeleton. The agent gets refs, stat, and content in the round trip it already spends.

Steps it removes per case, from the traces: the skeleton read (1, or 2 on big cases), `git diff --stat` (1), `git diff` (1 to 3). That is 3 to 5 of 8 to 29 steps. These steps carry 25k to 35k of context each, so the estimate is 75k to 150k tokens per case, 12% to 23% of the 644k baseline mean per case. It also makes the "numbers must come from the CLI, not from the patch" rule automatic (the `@@` header the agent reads is the ref), removes the lockfile risk (5.7k tokens in case 59), and makes `index` unnecessary in the workflow.

Large diffs still spill to a file in the Cursor shell tool (the 14.5k-token diff of case 57 was read back in 3 chunks). Printing per file with the ref on each `@@` line does not change that; it is a tool limit.

### C. Skill: batch the commands, drop the schema read, name what `validate` checks

Skill-only. Measured with a variant of `SKILL.md` (diff in the appendix), same prompt and model, 2 runs each:

| 7 cases, mean of 2 runs | Baseline | Variant | Change |
| --- | --- | --- | --- |
| Tokens | 4.51M | 3.01M | -33% |
| Steps | 96 | 80 | -17% |
| Tool calls | 178 | 127 | -29% |
| Output tokens | 48.6k | 42.5k | -13% |
| Instruction reads | 22 | 14 | -36% |
| Worst case | 2,062k | 877k | -57% |
| Per-case spread | 9.7x | 4.5x | |
| `validate` green | 13/14 | 14/14 | |

Per case (tokens, run 1 / run 2):

| Case | Baseline | Variant |
| --- | --- | --- |
| comprehende-39 | 382k / 284k | 371k / 303k |
| comprehende-47 | 2,062k / 800k | 832k / 877k |
| comprehende-50 | 235k / 274k | 240k / 197k |
| comprehende-57 | 425k / 1,008k | 412k / 527k |
| comprehende-59 | 904k / 488k | 385k / 602k |
| comprehende-67 | 1,242k / 403k | 423k / 361k |
| vitadeck-24 | 301k / 212k | 233k / 257k |

What the variant changes, and why each line earns its place:

1. Step 2 is one shell call: `npm view`, `review`, `git log`, `git diff --stat`. One round trip instead of three or four.
2. Step 3 is one shell call for the diff with lockfiles excluded, plus the source reads in the same round trip.
3. The schema pointer is gone; `example.md` shows every field and `validate` is the gate. Saves 1,937 tokens on every step after the read.
4. Step 6 lists what `validate` checks. In the baseline, agents read `dist/cli/main.js`, `commands.js`, `live.js`, `pins.js` to find out (case 59, run 1: 6 steps at 50k+ context each).
5. "Lockfiles stay in `skipped`" becomes "Lockfiles have no hunk refs". Removes the field hunt (case 59, run 1: 8 greps).
6. "Write the whole `review.json` in one write". The `edit` tool echoes a diff of the file back (3k to 6k tokens); `write` does not.

Small residual: the variant `SKILL.md` is 3,348 tokens (+226) because of the validate list and the batch block; the schema it stops loading is 1,937.

### D. Tighten `SKILL.md` prose

Estimate, not measured. The body is 3,122 tokens and is re-sent on every step (96 steps per 7 cases). A 25% trim saves about 780 tokens per step, 75k per 7 cases, under 2% of the total. Worth doing while editing for C, not worth a pass of its own. The step count is the lever, not the skill size.

### Combined estimate

A removes about 20% of the output tokens and the large-diff failure mode. B removes 3 to 5 steps per case. C is measured at -33% tokens and -17% steps. Because B removes steps that C still leaves (the variant still spent 2 steps per case on the skeleton read and `git diff`), the combined estimate is -45% to -55% tokens and -35% to -40% steps against today's baseline, with the worst case falling from 2.06M to under 0.6M.

## 3. Eval harness (CI cost, not the user path)

Two items outside the report-writing path, with numbers, because they set the eval bill and the eval wall time.

### Producer prompt

"The CLI named in the skill is the local build" sends the agent hunting: 94 calls and 73 steps across 14 runs (5 steps per case, the largest bucket in section 1), and in one run it built the reviewed repo's older CLI and failed `validate`. State it as a fact instead: the skill's `node <abs>/dist/cli/main.js` command is the CLI, it is built, run it as written. Estimate: -5 steps per case (a third of the baseline steps, though early ones with small context), and one less flaky failure.

### Graders

From CI run 35552579760:

| Case | Packet | Producer | Grouping grader | Prose grader |
| --- | --- | --- | --- | --- |
| comprehende-39 | 6k tok | 280k | 1,055k | 344k |
| comprehende-47 | 35k tok | 432k | 1,203k | 462k |
| comprehende-50 | 2k tok | 205k | 174k | 299k |
| comprehende-57 | 16k tok | 627k | 1,641k | 537k |
| comprehende-59 | 14k tok | 360k | 1,571k | 507k |
| comprehende-67 | 16k tok | 410k | 633k | 483k |
| vitadeck-24 | 4k tok | 239k | 424k | 452k |
| Total | | 2,552k (21%) | 6,701k | 3,084k |

Graders are 79% of the eval tokens and 2 to 3 minutes of each case's 3 to 4 minutes. A 6k-token packet costs the grouping grader 1.06M tokens because it has `read`, `grep`, `glob`, `ls` and spends 169 s reading the work tree. Two options: put the packet inline and run the grader without tools (one step, about packet + rules + output, 10k to 45k per grader; estimate -90% grader tokens), or keep tools and cap the run with a small step budget. The graded suite would go from about 12.3M to about 3.5M tokens per run.

## Appendix: skill variant used in section 2C

```diff
--- skills-next/comprehende/SKILL.md
+++ variant SKILL.md
@@ Workflow
-1. Check npm for a newer package. Run `npm view comprehende version`. ...
-2. Resolve base and head. ...
-3. Write a covering skeleton. ... Run `npx comprehende@0.8.0 review ...`. ...
-4. Recover the why, ... read `git diff --stat <base>...<head>` and the diffs themselves, ...
-5. Group the hunks ... Shape per [references/review.schema.json]; worked example in [references/example.md]. ...
-6. Run `npx comprehende@0.8.0 validate ...`. On failure, fix groups or coverage; ...
+Each step is one tool call where the step says so. Batch the commands as written; every extra round trip re-sends the whole context.
+
+1. Resolve base and head. (unchanged)
+2. One shell call: version check, skeleton, log, stat.
+   npm view comprehende version
+   npx comprehende@0.8.0 review --base <base> --head <head> --data "$REVIEW_DIR/review.json"
+   git log --format='%s%n%n%b' --end-of-options <base>...<head>
+   git diff --stat <base>...<head>
+   (version rule unchanged; `review` writes every hunk ref into one group named `ungrouped`)
+3. One shell call for the diff, lockfiles excluded (the skeleton has no hunk refs for them):
+   git diff <base>...<head> -- . ':(exclude)pnpm-lock.yaml' ':(exclude)package-lock.json' ':(exclude)yarn.lock' ':(exclude)Cargo.lock' ':(exclude)go.sum'
+   Read the sources in the same round trip.
+4. Read the skeleton once, for its hunk refs. Recover the why, write the title, write the what, ... (unchanged)
+5. Group the hunks ... Shape and field names: [references/example.md] shows every field. Write the whole `review.json` in one write; the skeleton's `ungrouped` group is replaced, not kept. ...
+6. Run `npx comprehende@0.8.0 validate ...`. It checks exactly these: every live hunk sits in a group, every ref matches live git, every `source:` id exists in `sources`, every group `part` has a `parts[]` entry, every PR comment pin (`path`, `side`, `line`) matches a live line, and the document has no unknown fields. On failure, fix what the message names; ...
@@ Grouping rules
-- Lockfiles stay in `skipped`; the UI gives them their own closed bucket. Hunk refs exist only for hunks the skeleton lists.
+- Lockfiles have no hunk refs; the CLI leaves them out of the skeleton and the UI gives them their own closed bucket. Hunk refs exist only for hunks the skeleton lists.
```

`references/review.schema.json` was removed from the variant and the pointer to it in `example.md` dropped. Everything else in the skill is unchanged.
