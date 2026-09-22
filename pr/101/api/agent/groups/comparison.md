Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 94cb4481550de0078f0e6593b69fa3d52c5730a9` and `git rev-parse --verify a9cb0a1366829560e85b08c80d24f0dcf2465f97` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 94cb4481550de0078f0e6593b69fa3d52c5730a9 a9cb0a1366829560e85b08c80d24f0dcf2465f97 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
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

Review concern 01 of 01: Eval comparison report (`comparison`)

Part: Eval comparison

The why:

The [Sep 22 session](source:s1) asks for these counts before the next release.

The what:

The new report lists suite, producer, and grader tokens and steps for the seven eval cases.

Hunk refs for this concern:
- docs/eval-token-comparison.md @@ -0,0 +1,112 @@