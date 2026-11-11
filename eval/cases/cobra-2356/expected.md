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
- The PR body still describes a three-index slice (`finalArgs[:len:len]`) on the `append(finalArgs, "--")` line, but head copies `trimmedArgs` with `make` plus `copy` at the top of `getCompletions`.
- The `make` plus `copy` at the top of `getCompletions` follows alexandear's review suggestion, which replaced the three-index slice.
- `TestCompletionDoesNotMutateOsArgs` sets `os.Args` itself instead of calling `SetArgs`, so the completion runs through the real `os.Args` path.
- The PR body test plan names `TestCompletionDoesNotMutateArgs`, but head has `TestCompletionDoesNotMutateOsArgs`.

## Good

- Without the fix the test fails because `os.Args[2]` changes from `"x"` to `"--"`.
- The bug shows with `TraverseChildren` because `Traverse` returns `args[i+1:]`, a sub-slice of `os.Args`, while `Find` removes the `__complete` word through `argsMinusFirstX`, which builds a new slice.
- In the ticket and the test, `"--"` overwrites the word being completed (`x`), because `trimmedArgs` drops only that last argument and keeps its capacity.
- The copy at the top also protects the flag value path, where `checkIfFlagCompletion` returns `args[:len(args)-1]`, another sub-slice with a spare slot.
- `TestCompletionDoesNotMutateOsArgs` replaced an earlier test that used `SetArgs`, after marckhouzam asked for a test that checks `os.Args` itself.
- The rename of the test program name from `"prog"` to `"root"` is marckhouzam's consistency nit and does not change what the test checks, because the `ExecuteC` guard matches only `cobra.test`.

## Must not

- Do not describe the fix at head as a three-index slice or as a change to the `append(finalArgs, "--")` line.
- Do not say alexandear called the three-index slice cryptic; ccoVeille and marckhouzam did.
- Do not say ccoVeille proposed copying `trimmedArgs` at the top of `getCompletions`; alexandear did.
- Do not cite ticket #2257 for the shared backing array cause, because the ticket reports only the inserted `"--"`.
- Do not say the copy changes the completions or the argument values that `ValidArgsFunction` receives; only the caller's args slice stays untouched.
- Do not write a focus range on the ten-line `completions.go` hunk; a hunk that short reads whole.
- Do not write a focus caption or a note that repeats the group summary or attention.
- Do not put the `completions_test.go` focus range on the test setup, such as the `os.Args` assignment, instead of the `ExecuteC` call and the `os.Args` checks after it.
- Do not write a note on the `trimmedArgs` copy that only restates its code comment, which already says the copy keeps the later append off the caller's backing array.
- Do not write a group attention that proposes the three-index slice or another way to copy `trimmedArgs`, because the copy was settled in review.
- Do not write a group question that asks why the fix copies `trimmedArgs` instead of using the three-index slice; the review thread gives that reason.

## Notes

- The `TraverseChildren` trace is `Good` because it needs `Traverse`, `Find`, and `argsMinusFirstX` in `command.go`, which the diff does not touch. The PR body says only that the bug is "most visible" with `TraverseChildren`.
- The three-index slice and the test name are both `Must`: each is a place where the PR body says one thing and head does another. The test rework history is `Good`, because the test at head already does what marckhouzam asked.
- The `"--"` slot claim is limited to the ticket and the test: on the flag value path, `checkIfFlagCompletion` drops the flag name, so at base `"--"` overwrote the flag name slot instead.
- The aliasing mechanism `Must` is the one core-change claim. A note on the `trimmedArgs` copy that only restates the code comment does not count as a new fact; the mechanism belongs in the group summary.
- Past runs missed the direct `os.Args` test in 22 of 23 runs and the aliasing mechanism in 21 of 23. Graders often flagged a group `lookFor` bullet that credited alexandear with "cryptic", and a `why` that cited the ticket for the backing array cause.
- `case.json` `together` keeps `completions.go` and `completions_test.go` in one group. `parts` 0 to 1: one story, named or not. `groups` 1 to 2: one group is best; two is slack for a review that repeats a hunk in a second concern, such as the reviewer-driven rework. `size` trivial or small: small is best, because the slice aliasing reads harder than the line count.
- Homes: the aliasing mechanism, the copy at the top, and the direct `os.Args` test live in the group summary or why. The three-index slice claim and the test name are document `lookFor` bullets, because the PR body describes an earlier fix and an earlier test. The group needs no attention: the change is a bug fix whose shape the review thread settled.
