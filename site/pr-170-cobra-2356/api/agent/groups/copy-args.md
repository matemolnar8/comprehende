Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify f2878bab8c96afd6e36968af96343b35dbb82a82` and `git rev-parse --verify a36b43475f0a868310fdce4ead976a0cfb8173ea` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames f2878bab8c96afd6e36968af96343b35dbb82a82 a36b43475f0a868310fdce4ead976a0cfb8173ea -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
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

Review concern 01 of 01: Copy the completion args (`copy-args`)

The why:

[#2257](source:s1) reports `--` in `os.Args` after completion. [marckhouzam](source:c4) asked for a test that checks `os.Args` itself.

The what:

`getCompletions` in `completions.go` copies `trimmedArgs` into a new slice, and `TestCompletionDoesNotMutateOsArgs` in `completions_test.go` checks that a completion run leaves `os.Args` as it was.

Hunk refs for this concern:
- completions.go
- completions_test.go