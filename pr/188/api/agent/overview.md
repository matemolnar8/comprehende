Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify fb5512b5d35ae631ce90b41c889b41320b2e4e71` and `git rev-parse --verify fe7755cb3305c36d02540799ccfbf0e24a2415d5` in this repository.
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

base (merge-base)  fb5512b5d35ae631ce90b41c889b41320b2e4e71

head               fe7755cb3305c36d02540799ccfbf0e24a2415d5

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames fb5512b5d35ae631ce90b41c889b41320b2e4e71 fe7755cb3305c36d02540799ccfbf0e24a2415d5

Commits:
- fe7755cb Eval: add parts cases; accept a page-object part in cigster-99
- 85dcf1f1 Skill: split stories that share one motive into parts

Sources:
- transcript Claude Code session · Nov 7 Agents split into parts too rarely; why-loop on multi-part PRs.
- commit Skill: split stories that share one motive into parts
- commit Eval: add parts cases; accept a page-object part in cigster-99

The title:

Split stories that share one motive into parts

The why:

Agents [split a review into parts less often than they could](source:t1).

The what (small):

The skill now gives each story its own `part` when one motive ties several stories together, and eight new eval cases check it.

## Review concerns

### 01 What counts as a story (`rule`)

Step 3 defines a story as work that could have been its own PR, and says a shared motive gives one `why`, not one story. `.agents/skills/comprehende/SKILL.md` is the synced copy of `skills-next/comprehende/SKILL.md`.

Attention (tradeoff):
Step 3 now asks the agent to split a retro or cleanup sweep into one part per fix, which can over-split. Two sentences hold it back: "One cause fixed in several places is one story", and small edits of one kind for one reader stay one story. Without the first, the single-bug `flask-6096-planted` case split into 2 parts in 2 of 2 runs.

[groups/rule.md](groups/rule.md)

### 02 Cases with one retro motive (`retro-cases`)

Three PRs where one retro motivates independent fixes; each case expects one part per fix. The old skill kept these in one part in 3 of 10 runs.

[groups/retro-cases.md](groups/retro-cases.md)

### 03 Cases that announce their split (`announced-cases`)

Five PRs whose title, body, or issues name two independent changes; each case expects two or three parts. The old skill already passed them, so they guard against a regression.

[groups/announced-cases.md](groups/announced-cases.md)

### 04 cigster-99 accepts a refactor part (`cigster-99`)

`eval/cases/cigster-99/expected.md` now accepts the page objects with the migrated visual specs as their own refactor part, and its Must not keeps only the `dependsOn` rule.

Attention (product):
The skill says a story holds its foundation, and the living-room spec imports `HostPage`, `TvPage`, `RemotePage`, and `PlayerPage`. The case now accepts those page objects in a separate refactor part, because they also carry the visual-spec migration and could have been their own PR first. `case.json` is unchanged, so no expect enforces either grouping.

[groups/cigster-99.md](groups/cigster-99.md)

### 05 Frozen PR and issue sources (`frozen-sources`)

`pnpm eval:add` wrote these JSON captures of each PR, its comments, and linked issues. Skip them: the eval reads them as the sources the skill would fetch.

[groups/frozen-sources.md](groups/frozen-sources.md)