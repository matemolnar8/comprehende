Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 61f79cce8191e348bcd1d72ade335b4c47c18ad9` and `git rev-parse --verify 603bbf138873e1fab673ef73d0a8238cc225190a` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 61f79cce8191e348bcd1d72ade335b4c47c18ad9 603bbf138873e1fab673ef73d0a8238cc225190a -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  61f79cce8191e348bcd1d72ade335b4c47c18ad9

head               603bbf138873e1fab673ef73d0a8238cc225190a

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 61f79cce8191e348bcd1d72ade335b4c47c18ad9 603bbf138873e1fab673ef73d0a8238cc225190a

Review concern 08 of 08: Frozen first-slice cases (`cases`)

Part: Report grader

The why:

The [design](source:s3) starts with seven PRs and constraints in `expect`, not a gold `review.json`.

The what:

Each case folder holds `case.json` plus frozen PR, issue, and comment JSON. `#50` and `#57` are tagged smoke.

Look for:
- Humans fill `expect`. `eval:add` writes empty expect. The checked-in cases already have constraints.

Depends on:
- 01 Case schema and flags (`schema`)

Hunk refs for this concern:
- eval/cases/comprehende-39/case.json @@ -0,0 +1,15 @@
- eval/cases/comprehende-39/sources/comments.json @@ -0,0 +1,1 @@
- eval/cases/comprehende-39/sources/pr.json @@ -0,0 +1,19 @@
- eval/cases/comprehende-39/sources/review-comments.json @@ -0,0 +1,1 @@
- eval/cases/comprehende-47/case.json @@ -0,0 +1,22 @@
- eval/cases/comprehende-47/sources/comments.json @@ -0,0 +1,1 @@
- eval/cases/comprehende-47/sources/issue-46.json @@ -0,0 +1,10 @@
- eval/cases/comprehende-47/sources/pr.json @@ -0,0 +1,19 @@
- eval/cases/comprehende-47/sources/review-comments.json @@ -0,0 +1,41 @@
- eval/cases/comprehende-50/case.json @@ -0,0 +1,14 @@
- eval/cases/comprehende-50/sources/comments.json @@ -0,0 +1,1 @@
- eval/cases/comprehende-50/sources/pr.json @@ -0,0 +1,19 @@
- eval/cases/comprehende-50/sources/review-comments.json @@ -0,0 +1,1 @@
- eval/cases/comprehende-57/case.json @@ -0,0 +1,18 @@
- eval/cases/comprehende-57/sources/comments.json @@ -0,0 +1,1 @@
- eval/cases/comprehende-57/sources/pr.json @@ -0,0 +1,19 @@
- eval/cases/comprehende-57/sources/review-comments.json @@ -0,0 +1,1 @@
- eval/cases/comprehende-59/case.json @@ -0,0 +1,14 @@
- eval/cases/comprehende-59/sources/comments.json @@ -0,0 +1,1 @@
- eval/cases/comprehende-59/sources/pr.json @@ -0,0 +1,19 @@
- eval/cases/comprehende-59/sources/review-comments.json @@ -0,0 +1,15 @@
- eval/cases/comprehende-67/case.json @@ -0,0 +1,19 @@
- eval/cases/comprehende-67/sources/comments.json @@ -0,0 +1,16 @@
- eval/cases/comprehende-67/sources/pr.json @@ -0,0 +1,19 @@
- eval/cases/comprehende-67/sources/review-comments.json @@ -0,0 +1,28 @@
- eval/cases/vitadeck-24/case.json @@ -0,0 +1,14 @@
- eval/cases/vitadeck-24/sources/comments.json @@ -0,0 +1,1 @@
- eval/cases/vitadeck-24/sources/pr.json @@ -0,0 +1,19 @@
- eval/cases/vitadeck-24/sources/review-comments.json @@ -0,0 +1,1 @@