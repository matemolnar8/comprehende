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

Review concern 01 of 05: expected.md is the source of the rubric lists (`rubric-lists`)

The why:

The grader and the cases both need one definition of what a Must, Good, and Must not item is, and the [brief](source:s1) asked for one source of truth a human can edit.

The what:

parseExpectedMd in scripts/eval/case.ts reads the bullets under the three headings that eval/review-criteria.md defines, and listEvalCases hands them to the runner as a Rubric beside the case spec.

Look for:
- A case folder with no expected.md gets three empty lists and runs on; an expected.md that lacks one of the three headings throws from loadEvalCase, which fails every eval run the way a broken case.json does.
- Only lines that start with a dash and a space under a heading count. A bullet wrapped onto a second line keeps only its first line.

Hunk refs for this concern:
- scripts/eval/case.ts
- scripts/eval/case.test.ts
- eval/review-criteria.md