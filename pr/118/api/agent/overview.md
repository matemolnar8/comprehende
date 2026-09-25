Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157` and `git rev-parse --verify 3bd6567d9534b1e5573a2bb24d8417b2d2770049` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157

head               3bd6567d9534b1e5573a2bb24d8417b2d2770049

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 3bd6567d9534b1e5573a2bb24d8417b2d2770049

Commits:
- 3bd6567 Eval: ungate comprehende-50 why; allow 8 parts on cigster-99
- ef1e688 Eval: re-score saved reviews with --rescore
- 1b139e4 Eval: default producer to Grok 4.6 high
- e9cd03b Eval: name the case work tree in the producer prompt
- cd8c738 Eval: accept model params in --producer-model and --grader-model
- 41adb30 Keep the canonical schema free to sit with its generator on comprehende-57
- ba86fbe Skill: why in the source's terms, overridden ticket items, manual steps
- 352dc1e Skill: bullet unmentioned behavior changes and non-obvious review fixes
- 44712c0 Skill: keep a feature's pieces in one group, and copies with their source
- 36849a9 Skill: unasked work gets its own part; order parts a story builds on first
- 2a12098 Skill: find the source sentence for the why, and check placement before done
- ecd0dd4 Eval: gate group count and cross-part dependsOn
- ee9f79a Skill: check sources against head and group by concern
- 94cd1a5 Expect no document why on comprehende-59
- 1a3d9a3 Fold expected outcomes into eval case expects
- 1e1081c Write expected review outcomes for every eval case

Sources:
- ticket #117 Gating checks on main always pass and are too loose. Write expected outcomes, fold them into case.json, iterate the skill until reviews match across repeated runs.
  https://github.com/matemolnar8/comprehende/issues/117
- pr PR #118 Phase 1 expected outcomes plus a first phase 2 skill pass. Default producer is now grok-4.6 high. Graders stay grok-4.6.
  https://github.com/matemolnar8/comprehende/pull/118

The title:

Expected eval outcomes and a skill pass that meets more of them

The why:

[#117](source:s1) says the gating checks on main always pass and are too loose to steer the skill. Write a human expected outcome per case, fold it into expects, and iterate the skill until reviews match.

The what (large):

Each eval case gets an `expected.md` and tighter `case.json` gates. The skill adds source-vs-head lookFor, a stricter why, and grouping rules the harness can check. The runner takes model params, names the case work tree, defaults the producer to `grok-4.6:effort=high`, and can `--rescore` saved reviews.

Look for:
- [#117](source:s1) is done when the skill meets the new expects across repeated graded runs. This branch's Composer rounds were 30/59. One Grok 4.6 high sample was 10/10. The repeated Grok suite is not in this diff.

## Review concerns

### 01 Written expected outcome per case (`expected`)

`eval/review-criteria.md` holds the shared criteria and template. Each case adds `expected.md` with story, groups, must-state claims, and baseline.

[groups/expected.md](groups/expected.md)

### 02 Fold outcomes into case.json gates (`expects`)

Each `case.json` gets `parts` and `groups` ranges, tests-with-code `together` pairs, `apart` pairs, and the must-state `claims`.

Depends on:
- 01 Written expected outcome per case (`expected`)

[groups/expects.md](groups/expects.md)

### 03 Skill rules the expects encode (`skill`)

The next skill checks each source against head, writes why only from a stated problem or goal, keeps tests and copies with the code they serve, and bullets hidden behavior and overridden ticket items.

[groups/skill.md](groups/skill.md)

### 04 Harness gates, producer models, and rescore (`harness`)

`checks` gates group count and cross-part `dependsOn`. The runner parses `id:param=value`, names the case work tree, defaults the producer to `grok-4.6:effort=high`, and `--rescore` re-checks saved `review.json` files.

Depends on:
- 02 Fold outcomes into case.json gates (`expects`)

[groups/harness.md](groups/harness.md)

### 05 Identical agents skill copy (`skill-copy`)

`.agents/skills/comprehende/` is an identical copy of the next skill and example.

Depends on:
- 03 Skill rules the expects encode (`skill`)

[groups/skill-copy.md](groups/skill-copy.md)