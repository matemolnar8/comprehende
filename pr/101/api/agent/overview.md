Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 94cb4481550de0078f0e6593b69fa3d52c5730a9` and `git rev-parse --verify a9cb0a1366829560e85b08c80d24f0dcf2465f97` in this repository.
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

base (merge-base)  94cb4481550de0078f0e6593b69fa3d52c5730a9

head               a9cb0a1366829560e85b08c80d24f0dcf2465f97

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 94cb4481550de0078f0e6593b69fa3d52c5730a9 a9cb0a1366829560e85b08c80d24f0dcf2465f97

Commits:
- a9cb0a1 Add an eval token and step comparison of 0.8.0 and main.

Sources:
- transcript Cursor session · Sep 22 Asks for a token and step comparison of the current tree and the previous release across the eval suite, before the next version.
- commit Add an eval token and step comparison of 0.8.0 and main. One graded run of each tree: producer tokens stay near 2.7M, and producer steps fall from 21 to 14.

The title:

Eval token and step comparison

The why:

The [Sep 22 session](source:s1) asks for token and step counts of 0.8.0 and main across the eval suite, before the next release.

The what (small):

`docs/eval-token-comparison.md` records one graded run of release 0.8.0 and one of main. The tables list tokens and steps for the producer and the graders.

Look for:
- The [Sep 22 session](source:s1) asks for tokens and step counts across the eval suite. This file reports one graded run of 0.8.0 and one of main, with producer and graders split.

## Review concerns

### 01 Eval comparison report (`comparison`)

The new report lists suite, producer, and grader tokens and steps for the seven eval cases.

[groups/comparison.md](groups/comparison.md)