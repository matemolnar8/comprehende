# cobra-2356: Stop shell completion from changing os.Args

PR #2356. Fixes ticket #2257. Five review comments and seven issue comments. A four-line Go bug fix in `completions.go` plus one regression test.

## Story

- Title: the PR title, or a short name for "completion no longer changes `os.Args`".
- Why: present, from ticket #2257. Completion inserts `"--"` into `os.Args`, so a `ValidArgsFunction` that reads `os.Args` sees wrong data.
- Size: small. One subtle slice aliasing fix and one test. Trivial is also fine, since the code change is four lines.
- Parts: one story. A review can name it as one part or omit parts.
- Groups: 1.

## Groups

1. Args copy and regression test: `completions.go`, `completions_test.go`. The test checks only this fix, so it reads with the fix.

## Must

- Before the fix, `trimmedArgs` is a sub-slice of the caller's args, so `append(finalArgs, "--")` in `getCompletions` can write `"--"` into the backing array of `os.Args` instead of a new array.
- At head the fix copies `trimmedArgs` into a new slice with `make` plus `copy` at the top of `getCompletions`, while the PR body still describes a three-index slice (`finalArgs[:len:len]`) and the `append(finalArgs, "--")` line is unchanged.
- The fix follows alexandear's review suggestion to copy `trimmedArgs` at the top, which replaced the three-index slice that ccoVeille and marckhouzam called cryptic.
- `TestCompletionDoesNotMutateOsArgs` sets `os.Args` itself instead of calling `SetArgs`, so the completion runs through the real `os.Args` path and the test checks that `os.Args` is unchanged.

## Good

- Without the fix the test fails because `os.Args[2]` changes from `"x"` to `"--"`.
- The bug shows with `TraverseChildren` because `Traverse` returns `args[i+1:]`, a sub-slice of `os.Args`, while `Find` removes the `__complete` word through `argsMinusFirstX`, which builds a new slice.
- The slot that `"--"` overwrites holds the word being completed (`x` in the ticket and the test), because `trimmedArgs` drops only that last argument and keeps its capacity.
- The copy at the top also protects the flag value path, where `checkIfFlagCompletion` returns `args[:len(args)-1]`, another sub-slice with a spare slot.
- The PR body test plan names `TestCompletionDoesNotMutateArgs`, but the test at head is `TestCompletionDoesNotMutateOsArgs`, reworked from an earlier `SetArgs` test after marckhouzam asked for a test that checks `os.Args` itself.
- The guard in `ExecuteC` skips `os.Args` only when the program name is `cobra.test`, so the rename from `"prog"` to `"root"` is the consistency nit from marckhouzam and does not change what the test checks.

## Must not

- Do not describe the fix at head as a three-index slice or as a change to the `append(finalArgs, "--")` line.
- Do not split `completions.go` and `completions_test.go` into separate groups.
- Do not say alexandear called the three-index slice cryptic, or that ccoVeille proposed copying `trimmedArgs` at the top of the function.
- Do not cite ticket #2257 for the shared backing array cause; the ticket reports only the inserted `"--"`, and the PR body and review comments name the cause.
- Do not say the copy changes the completions or the argument values that `ValidArgsFunction` receives; only `os.Args` stays untouched.

## Notes

- The `TraverseChildren` trace is `Good` because it needs `Traverse`, `Find`, and `argsMinusFirstX` in `command.go`, which the diff does not touch. The PR body says only that the bug is "most visible" with `TraverseChildren`.
- The test name mismatch is a true PR body divergence but minor, so it is `Good`. The three-index slice divergence is `Must` because it describes the fix itself.
- Past runs missed the direct `os.Args` test in 22 of 23 runs and the aliasing mechanism in 21 of 23. Graders often flagged a `lookFor` that credited alexandear with "cryptic", and a `why` that cited the ticket for the backing array cause.
- `parts` 0 to 1: one story, named or not. `groups` 1 to 2: one group is best; two is slack for a review that repeats a hunk in a second concern, such as the reviewer-driven rework. `size` trivial to medium: small is best, the slice aliasing reads harder than the line count.
