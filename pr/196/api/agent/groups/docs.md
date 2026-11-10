Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a6854906c4b4b901e5047622203c2e9b45854959` and `git rev-parse --verify f00f1c4c67f2bf2c9b9e42474809f7c9eb3e28dd` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a6854906c4b4b901e5047622203c2e9b45854959 f00f1c4c67f2bf2c9b9e42474809f7c9eb3e28dd -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  a6854906c4b4b901e5047622203c2e9b45854959

head               f00f1c4c67f2bf2c9b9e42474809f7c9eb3e28dd

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a6854906c4b4b901e5047622203c2e9b45854959 f00f1c4c67f2bf2c9b9e42474809f7c9eb3e28dd

Review concern 03 of 03: Eval docs (`docs`)

The what:

`docs/eval.md` and `eval/review-criteria.md` list the two new expects with the existing ones.

Depends on:
- 01 Part-level expects (`checks`)

Hunk refs for this concern:
- docs/eval.md
- eval/review-criteria.md