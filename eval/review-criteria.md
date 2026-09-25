# Review criteria for eval cases

Each case has an `expected.md` next to its `case.json`. It says what a good review of that pull request looks like. `case.json` holds the parts of it the harness can check. The rest is for humans and graders.

## Criteria

1. Group by goal. Hunks that work toward the same goal are one group. Work that could have been its own pull request is its own group, and its own `part` when it is a separate story.
2. Keep the group count low. A small change has one to three groups. Do not make a group per file, per test file, or per one-line call site.
3. A test that checks one group's code sits in that group. Tests are their own group when they are the concern (new harness, test-only refactor) or when one test covers several groups.
4. Generated output, pure moves, and synced copies sit in one trailing group, or with their source. The summary says what the reader can skip, for example "identical copy" or "same schema, keys reordered".
5. `dependsOn` only when the reader needs the earlier group to understand this one. Never across parts.
6. Compare every source item with the diff. Flag each place where the diff does something other than what the ticket, PR, or review comment asks. Say what the source asks, what the diff does, and the reason when a source or the code gives one. Do not list items the diff simply does.
7. Check the PR description against the code. A claim in the PR that is not true at head is a finding, not a fact to repeat.
8. Name scope the sources do not ask for, such as extra events, dependency bumps, or production code in a test PR.
9. `lookFor` is only for what a typical engineer would miss. A bullet that says "confirm X" or restates the test plan is padding. A resolved review comment is not a bullet unless the fix is not obvious.
10. Every claim is true at head. A wrong claim is worse than a missing one.
11. Short, plain sentences in Simplified Technical English. Detail belongs in "Ask an AI about this", not in the review.

## Expected outcome template

Each `expected.md` uses these sections, in this order:

- **Story**: title, why (present or absent, and from which source), size, parts, and group count.
- **Groups**: the groups a good review has, with the files in each.
- **Must state**: claims a reader must come away with. These go in `case.json` `claims`.
- **Good to state**: claims that make the review better but do not fail it.
- **Must not**: mistakes seen in runs or likely for this change.
- **Baseline**: what the six runs on `main` at `a6c2a1cd` did (issue #117), in a few bullets.
- **case.json**: what changed in the expects and why.
