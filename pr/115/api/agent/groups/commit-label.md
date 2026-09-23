Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 4c59452449c16ba800b5753c21f1202692cc242c` and `git rev-parse --verify c6166adca3958cd1d39b891ca8b857ec10a12ed0` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 4c59452449c16ba800b5753c21f1202692cc242c c6166adca3958cd1d39b891ca8b857ec10a12ed0 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  4c59452449c16ba800b5753c21f1202692cc242c

head               c6166adca3958cd1d39b891ca8b857ec10a12ed0

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 4c59452449c16ba800b5753c21f1202692cc242c c6166adca3958cd1d39b891ca8b857ec10a12ed0

Review concern 02 of 02: Match a commit subject without its final period (`commit-label`)

Part: 47 label

The why:

[The failing run](source:s1) labels commit s5 with the PR 47 subject and omits the final period. Git still has that subject.

The what:

commitLabelMatchesSubject ignores one trailing period, and the test still rejects a different subject.

Look for:
- Subtle: stripOneTrailingPeriod removes only a final period, so a subject ending in 0.5.5. still matches a label that keeps both version dots.

Hunk refs for this concern:
- scripts/eval/checks.ts
- scripts/eval/checks.test.ts