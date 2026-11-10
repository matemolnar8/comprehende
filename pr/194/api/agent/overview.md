Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 742c7c46b48dec27a765681256e41cd7cab1017f` and `git rev-parse --verify bd4dffc00d5e2489eec48e49eefda626f8f7fe7d` in this repository.
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

base (merge-base)  742c7c46b48dec27a765681256e41cd7cab1017f

head               bd4dffc00d5e2489eec48e49eefda626f8f7fe7d

Named refs at pin: 742c7c46b48dec27a765681256e41cd7cab1017f ... bd4dffc0

Read the diff:

git diff --find-renames 742c7c46b48dec27a765681256e41cd7cab1017f bd4dffc00d5e2489eec48e49eefda626f8f7fe7d

Commits:
- bd4dffc0 Eval: give a producer 45 minutes, so Grok 4.7 High finishes large cases
- 687e4eff Eval: keep an early-exiting producer CLI from crashing the run with EPIPE
- e340494d Digest: pair each digest with its own file when marking mirrors
- a089d5b6 Skill: tie-break grouping and parts choices for consistent reviews
- bf6ef3cd Merge remote-tracking branch 'origin/main' into t3/presentation-time-cost-effort
- 5d2349a7 Merge remote-tracking branch 'origin/main' into t3/presentation-time-cost-effort
- 54bd02be Merge remote-tracking branch 'origin/main' into t3/presentation-time-cost-effort
- c2182fd6 Eval: check the skill's batch and write blocks, not reworded sentences
- d9798ace Eval: add a Cursor CLI producer
- 1be51201 Skill: route each fact to one field; moves say what differs; prove unchanged claims
- a6dd7906 Eval: show the Claude result text when a run ends in an error
- 7cf8d6b6 Skill: restore the full fact list; drop the five-file group hint
- 5be86ae6 Skill: drop dir-<name> draft groups
- 3588ec3e CLI: drop directory drafts from pregroup
- db4cb833 Skill: rewrite for one place per rule; read by batch; terse fact list
- 729cfd16 CLI: show --batch, directory drafts, and a size guess
- 8e700463 Docs: Claude producer in eval.md
- f62d36b7 Eval: run the producer in Claude Code for a claude-* model

Sources:
- pr PR #194 CLI read batches, skill tie-breaks, Claude and Cursor eval producers.
  https://github.com/matemolnar8/comprehende/pull/194
- commit Eval: give a producer 45 minutes, so Grok 4.7 High finishes large cases

The title:

Reviews group the same way across runs: group ARI 0.72 → 0.81, half the expect failures

The why:

[PR #194](source:s1) says reviews of one change grouped differently from run to run, and the skill took long to read and was hard to follow.

The what (large):

The CLI packs the files to read into `show --batch` batches, and the skill is rewritten around them with grouping tie-breaks. The eval also gains Claude Code and Cursor producers.

## Review concerns

### 01 Read batches and size guess (`batch-plan`)

`readingPlan` in `batch.ts` picks the files to read and packs them into batches that `show --batch` prints. `digest` adds a `read:` line and a size guess, and `pregroup` writes that guess as `size`.

Attention (risk):
`skipReason` leaves out lockfiles, images, binaries, +0/-0 renames and copies, moves, generated files, and every mirror but the first. The skill reads a skipped file only when the agent asks with `show --file`. A mirror matches on identical added and removed lines, so a copy with the same lines at another place is not read. Decide whether this skip list is safe for any reviewed repo.

Questions:
- Why are the `guessSize` floors 20, 200, 550, and 2,000 changed lines?

[groups/batch-plan.md](groups/batch-plan.md)

### 02 Mirror pairing after a binary (`mirror-fix`)

`buildDigest` now pairs each digest with its own file before `markMirrors`, so a skipped binary no longer shifts the pairing. `show --batch`, `pregroup`, `refresh`, and the coverage checks all call `buildDigest`.

[groups/mirror-fix.md](groups/mirror-fix.md)

### 03 Skill rewrite with tie-breaks (`skill-rewrite`)

The skill puts each rule in one section, reads by `show --batch` in step 3, and adds tie-breaks for groups and parts. The `.agents/skills/comprehende/` files repeat `skills-next/comprehende/`, and the digest marks them the same change, so read the `skills-next` files and skip the copies.

Attention (product):
Step 4 now says a close split or merge call keeps one group, and Grouping drops the old hint that a review of more than five files rarely fits one group. Runs agree more often, but a review can hold fewer, bigger groups. Decide whether bigger groups are an acceptable price for the higher group ARI.

Depends on:
- 01 Read batches and size guess (`batch-plan`)

[groups/skill-rewrite.md](groups/skill-rewrite.md)

### 04 Claude Code and Cursor producers (`eval-producers`)

`parseProducer` sends a `claude-*` model to `runClaudeCodeAgent` and a `cursor/<model>` model to `runCursorAgent`, both on the shared `runHeadless`; other models stay on Muse. Case lines and run totals print producer cost and reasoning tokens when the runner reports them.

Attention (risk):
`runClaudeCodeAgent` passes `--dangerously-skip-permissions`, and `runCursorAgent` passes `--force --trust --sandbox disabled`. The producer runs any shell command on the developer's machine with their CLI login, and no flag in these arguments limits it to the clone. Decide whether an eval run may run unchecked like this.

[groups/eval-producers.md](groups/eval-producers.md)