# cobra-2356: Stop shell completion from changing os.Args

PR #2356. Fixes ticket #2257. Five review comments and seven issue comments.

## Story

- Title: the PR title.
- Why: present, from ticket #2257. Completion inserts `"--"` into `os.Args`, so a `ValidArgsFunction` that reads `os.Args` sees wrong data. The PR body repeats this as fixes #2257.
- Size: small. Two files, 59 added and 1 removed, one concern. Trivial is allowed since the burden reads that low.
- Parts: 1. Groups: 1.

## Groups

1. Args copy plus regression test: `completions.go`, `completions_test.go`. The test checks only this fix, so it sits in the same group.

## Must state

- At head the fix copies `trimmedArgs` with `make` plus `copy` at the top of `getCompletions`. The PR body still describes a three index slice, but review discussion replaced it and the append of `"--"` is unchanged.
- `append(finalArgs, "--")` can write `"--"` into the shared backing array when the sub slice has spare capacity. This corrupts `os.Args`. It shows most with `TraverseChildren`, since `Traverse` returns sub slices that share the array.
- The new test `TestCompletionDoesNotMutateOsArgs` sets `os.Args` directly instead of `SetArgs`, so the code takes the real `os.Args[1:]` path. Without the fix `os.Args[2]` changes from `"x"` to `"--"`.

## Good to state

- The test uses program name `"root"`, not `"cobra.test"`, to bypass the test guard in `ExecuteC`. A review nit asked for this rename.
- The maintainer asked for a test that checks `os.Args` itself. The author reworked an earlier `SetArgs` based test into the direct `os.Args` test.
- Copying at the top guards all later appends, not just the `"--"` one. A reviewer proposed this as clearer than the three index slice.

## Must not

- Do not describe the fix as a three index slice. The PR body says that, but head uses `make` plus `copy`.
- Do not split `completions.go` and `completions_test.go` into separate groups. The test checks only this fix.
- Do not add document `lookFor` padding about manual QA or build steps. The stale slice wording is the one source mismatch, and Must state covers it.

## Baseline

- First musecode run: 1 group, parts 0, size small, claims 1 of 3. No expects change.
- Second musecode run: 1 group, parts 0, size trivial, claims 0 of 3. Size widened to trivial. The review stayed good, so the claims miss is grader strictness plus a thinner lookFor.
- Third musecode run: 1 group, parts 0, size small, claims 1 of 3.

## case.json

- `why` present, from ticket #2257.
- `parts` 0 to 2, `groups` 1 to 2, `size` trivial to medium. Slack around the best estimate of 1 group, small. 0 parts allows a review with no named parts.
- `together`: `completions.go` with `completions_test.go`. No `apart` and no mechanical paths. Two files live in one group.
- `sourceKinds`: ticket, pr, pr-comment. The issue, the PR body, and both comment threads all shape the review.
- Added three claims: the stale slice wording, the aliasing mechanism, and the direct `os.Args` test.
