Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify df677575fda82ed86e32754f10d70d9f5992cf23` and `git rev-parse --verify 9a5f8fa9b7438b31aaa738355951e6880d973d42` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames df677575fda82ed86e32754f10d70d9f5992cf23 9a5f8fa9b7438b31aaa738355951e6880d973d42 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  df677575fda82ed86e32754f10d70d9f5992cf23

head               9a5f8fa9b7438b31aaa738355951e6880d973d42

Named refs at pin: df67757 ... HEAD

Read the diff:

git diff --find-renames df677575fda82ed86e32754f10d70d9f5992cf23 9a5f8fa9b7438b31aaa738355951e6880d973d42

Review concern 03 of 05: Case line, deltas, totals, and report show the rubric counts (`scores`)

The why:

Every consumer of CaseResult read grouping, prose, and claims, which no longer exist [session](source:s1).

The what:

CaseResult in scripts/eval/result.ts carries one rubric field, and formatCaseLine, formatBaselineDelta, formatRunTotals, and rubricHtml in report.ts all count it through rubricCounts.

Look for:
- formatBaselineDelta prints must, good, mustNot, and bullets deltas only when both the current and the previous result have a rubric; a run against a baseline from before this change prints only the check deltas.

Depends on:
- 02 One rubric grader call per case (`grader`)

Hunk refs for this concern:
- scripts/eval/result.ts
- scripts/eval/report.ts
- scripts/eval/report.test.ts