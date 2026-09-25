Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157` and `git rev-parse --verify 41adb309df1d25389e80787bfcd834719986a4a8` in this repository.
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

head               41adb309df1d25389e80787bfcd834719986a4a8

Named refs at pin: a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 ... 41adb309df1d25389e80787bfcd834719986a4a8

Read the diff:

git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 41adb309df1d25389e80787bfcd834719986a4a8

Commits:
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
- ticket #117 Write an expected outcome per case, fold it into case.json, then iterate on the skill.
  https://github.com/matemolnar8/comprehende/issues/117
- pr PR #118 Phase 1 and a first phase 2 pass of #117.
  https://github.com/matemolnar8/comprehende/pull/118

The title:

Expected review outcomes for every eval case, and a skill that meets more of them

The why:

[#117](source:s1) asks for a written expected outcome per eval case, then skill changes until the reviews meet those outcomes, because the old gates passed every run.

The what (large):

Adds review criteria and one `expected.md` per eval case, tightens each `case.json` with two new harness gates, and changes the skill to check sources against head and to group by concern.

Look for:
- [#117](source:s1) is done when the skill meets the expects consistently across runs. It does not yet: 30 of 59 graded runs pass the gates, against 16 of 60 for the baseline.
- Breaking: merging runs the graded suite on `main`, and about half the cases still fail a gate, so that job goes red.

## Review concerns

### 01 Shared review criteria (`criteria`)

`eval/review-criteria.md` lists the grouping, source-check, and lookFor rules, and the section template each `expected.md` follows.

[groups/criteria.md](groups/criteria.md)

### 02 Expected outcome per case (`outcomes`)

Each `expected.md` names the groups, the must-state and good-to-state claims, the mistakes to avoid, and what the six baseline runs did.

Depends on:
- 01 Shared review criteria (`criteria`)

[groups/outcomes.md](groups/outcomes.md)

### 03 Group count and cross-part dependsOn gates (`harness`)

`checks.ts` adds a `groups` range expect and fails any `dependsOn` that points into another part, with the schema in `case.ts`, the report line in `result.ts`, and tests.

[groups/harness.md](groups/harness.md)

### 04 Tighter case.json expects (`expects`)

Each `case.json` gets `parts` and `groups` ranges, `together` pairs that keep tests with their code, fuller `mechanicalPaths`, and the must-state claims.

Depends on:
- 03 Group count and cross-part dependsOn gates (`harness`)

[groups/expects.md](groups/expects.md)

### 05 Skill: sources against head, grouping by concern (`skill`)

`skills-next/comprehende/SKILL.md` gives every source item a verdict from head, takes the why from a stated problem or goal, keeps tests and call sites with their code, and adds `lookFor` cases. The `.agents/` files are identical synced copies.

[groups/skill.md](groups/skill.md)