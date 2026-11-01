Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify f2878bab8c96afd6e36968af96343b35dbb82a82` and `git rev-parse --verify a36b43475f0a868310fdce4ead976a0cfb8173ea` in this repository.
   Done when both objects exist.

2. Choose the relevant review concerns.
   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.
   Done when every concern the question touches has its markdown loaded.

3. Answer from live git.
   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: cobra
Origin: https://github.com/spf13/cobra.git

base (merge-base)  f2878bab8c96afd6e36968af96343b35dbb82a82

head               a36b43475f0a868310fdce4ead976a0cfb8173ea

Named refs at pin: f2878bab8c96afd6e36968af96343b35dbb82a82 ... a36b43475f0a868310fdce4ead976a0cfb8173ea

Read the diff:

git diff --find-renames f2878bab8c96afd6e36968af96343b35dbb82a82 a36b43475f0a868310fdce4ead976a0cfb8173ea

Commits:
- f2878ba Ignore the linter error (#2390)
- 85c12c2 projects_using_cobra: add Ollama (#2389)
- a36b434 address review: copy trimmedArgs upfront, rename prog to root
- 52ae4cf test: check os.Args directly in completion mutation test
- dc253dd fix: prevent completions from mutating os.Args via append side effect

Sources:
- ticket #2257 With `TraverseChildren`, `__complete x` shows `--` in `os.Args` instead of `x`.
  https://github.com/spf13/cobra/issues/2257
- pr PR #2356 Describes the shared backing array and a three-index slice fix, plus a regression test.
  https://github.com/spf13/cobra/pull/2356
- pr-comment alexandear on PR #2356
  https://github.com/spf13/cobra/pull/2356#discussion_r2902261970
- pr-comment ccoVeille on PR #2356
  https://github.com/spf13/cobra/pull/2356#discussion_r2836176311
- pr-comment marckhouzam on PR #2356
  https://github.com/spf13/cobra/pull/2356#discussion_r2880881643
- pr-comment marckhouzam on PR #2356 (test)
  https://github.com/spf13/cobra/pull/2356#issuecomment-3878459333

The title:

Prevent completions from mutating os.Args via append side effect

The why:

[#2257](source:s1) reports that shell completion inserts `--` into `os.Args`, so code that reads `os.Args` during completion sees `--` where the typed word was.

The what (small):

`getCompletions` copies `trimmedArgs` into a new slice before it appends `--`, and a new test checks that a completion run leaves `os.Args` as it was.

Look for:
- The [PR description](source:s2) says the fix caps capacity with a three-index slice (`finalArgs[:len:len]`). At head, `getCompletions` copies `trimmedArgs` into a new slice with `make` and `copy`, and `append(finalArgs, "--")` is unchanged. The copy is [alexandear's suggestion](source:c1), after [ccoVeille](source:c2) and [marckhouzam](source:c3) called the three-index slice cryptic.

## Review concerns

### 01 Copy the completion args (`copy-args`)

`getCompletions` in `completions.go` copies `trimmedArgs` into a new slice, and `TestCompletionDoesNotMutateOsArgs` in `completions_test.go` checks that a completion run leaves `os.Args` as it was.

[groups/copy-args.md](groups/copy-args.md)