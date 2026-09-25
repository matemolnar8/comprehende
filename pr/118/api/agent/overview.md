Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157` and `git rev-parse --verify 1a3d9a3a44e69e8cd551a4a1484c447c28db5c3f` in this repository.
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

head               1a3d9a3a44e69e8cd551a4a1484c447c28db5c3f

Named refs at pin: a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 ... 1a3d9a3a44e69e8cd551a4a1484c447c28db5c3f

Read the diff:

git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 1a3d9a3a44e69e8cd551a4a1484c447c28db5c3f

Commits:
- 1a3d9a3 Fold expected outcomes into eval case expects
- 1e1081c Write expected review outcomes for every eval case

Sources:
- ticket #117 Write an expected outcome per case, then fold it into case.json and iterate on the skill.
  https://github.com/matemolnar8/comprehende/issues/117
- pr PR #118 Phase 1 of #117, drafted by an agent for Máté's review.
  https://github.com/matemolnar8/comprehende/pull/118

The title:

Expected review outcomes for every eval case

The why:

[#117](source:s1) asks for a written expected outcome per eval case, because the current gates pass every run and do not steer the skill.

The what (medium):

Adds shared review criteria and one `expected.md` per eval case, then tightens each `case.json` to match those outcomes.

Look for:
- [#117](source:s1) says notes go in issue comments or straight into `case.json`. The change puts them in `expected.md` files next to each case, so they stay versioned with the expects.
- Breaking: the new gates fail most past reviews. Re-scoring the 60 reviews from the six baseline runs gives 18 passes, against 60 with the old gates. A merge to `main` runs the graded suite and will likely go red.

## Review concerns

### 01 Shared review criteria (`criteria`)

`eval/review-criteria.md` lists the grouping, source-comparison, and lookFor rules, and the section template each `expected.md` follows.

[groups/criteria.md](groups/criteria.md)

### 02 Expected outcome per case (`outcomes`)

Each `expected.md` names the groups, the must-state and good-to-state claims, the mistakes to avoid, and what the six baseline runs did.

Depends on:
- 01 Shared review criteria (`criteria`)

[groups/outcomes.md](groups/outcomes.md)

### 03 Tighter case.json expects (`expects`)

Each `case.json` gets tighter `parts` ranges, `together` pairs that keep tests with their code, fuller `mechanicalPaths`, and the must-state claims.

[groups/expects.md](groups/expects.md)