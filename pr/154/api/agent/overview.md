Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify df677575fda82ed86e32754f10d70d9f5992cf23` and `git rev-parse --verify 9a5f8fa9b7438b31aaa738355951e6880d973d42` in this repository.
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
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  df677575fda82ed86e32754f10d70d9f5992cf23

head               9a5f8fa9b7438b31aaa738355951e6880d973d42

Named refs at pin: df67757 ... HEAD

Read the diff:

git diff --find-renames df677575fda82ed86e32754f10d70d9f5992cf23 9a5f8fa9b7438b31aaa738355951e6880d973d42

Commits:
- 9a5f8fa Eval: cigster splits the two-fact Must items
- a11a821 Eval: shadcn splits the ALL_PROXY scheme item into two facts
- aed36da Eval: Must items name the main fact, mechanics move to Good and Notes
- 5046a58 Eval: the grader reads at most four files for bullet checks
- 153cef5 Eval: the grader accepts the main fact; shorter Must items
- 0a4a58b Eval: rewrite every expected.md from the pull request
- 4402305 Eval: one rubric grader per case, read from expected.md

Sources:
- transcript Claude Code session · Oct 23 Redesign the eval grading so it is simple and effective: deterministic pass or fail stays, one rubric call per case with must, good, mustNot lists and a bounded lookFor truth check, prose quality as lints, every expected.md rewritten from the PR by a trusted model, rescore grades saved reviews, validate on saved reviews before producer runs.
- commit Eval: one rubric grader per case, read from expected.md
- commit Eval: rewrite every expected.md from the pull request
- commit Eval: the grader accepts the main fact; shorter Must items

The title:

Eval: one rubric grader per case, expected.md rewritten by hand

The why:

A census of 133 graded runs found the grading itself was the biggest source of noise: a missing claim counted up to three times, free-text majors swinging about 50% between runs, graders that never saw expected.md, and grading that cost more than producing [session](source:s1).

The what (medium):

The two free-text Muse graders become one rubric call that answers yes or no per expected.md item and checks each lookFor bullet at head. Every expected.md is rewritten from its pull request, and case.json drops claims for together and apart pairs.

Look for:
- The [brief](source:s1) asked to generate or validate the case.json lists from expected.md. At head there are no lists in case.json: scripts/eval/case.ts reads the Must, Good, and Must not bullets from expected.md at load time, so expected.md is the only source.
- The [brief](source:s1) asked to extend together and apart pairs from each Groups section. A sweep of 133 saved reviews with --rescore --no-graders showed three of the new pairs failing most good reviews on a judgment call, so they were dropped; the audit-vs-page-objects apart pair on cigster-99 stays and fails 5 of 23 saved reviews because the skill folds the report into the page objects.
- The [brief](source:s1) shows the case line as mustNot 0. At head it prints mustNot hits over items, mustNot 0/5, so a case with no Must not list reads differently from one with no hits.
- Grader verdicts still do not change the exit code. caseFailed in scripts/eval/result.ts reads only producerError, validateError, and checks.failures, as before.

## Review concerns

### 01 expected.md is the source of the rubric lists (`rubric-lists`)

parseExpectedMd in scripts/eval/case.ts reads the bullets under the three headings that eval/review-criteria.md defines, and listEvalCases hands them to the runner as a Rubric beside the case spec.

[groups/rubric-lists.md](groups/rubric-lists.md)

### 02 One rubric grader call per case (`grader`)

runRubricGrader in scripts/eval/graders.ts sends the packet plus the numbered lists and the review's lookFor bullets, and parseRubricReply zips the model's positional yes or no arrays back onto the item text that run.ts passes in.

Depends on:
- 01 expected.md is the source of the rubric lists (`rubric-lists`)

[groups/grader.md](groups/grader.md)

### 03 Case line, deltas, totals, and report show the rubric counts (`scores`)

CaseResult in scripts/eval/result.ts carries one rubric field, and formatCaseLine, formatBaselineDelta, formatRunTotals, and rubricHtml in report.ts all count it through rubricCounts.

Depends on:
- 02 One rubric grader call per case (`grader`)

[groups/scores.md](groups/scores.md)

### 04 Summary lints replace the prose grader (`lints`)

proseLints in scripts/eval/checks.ts counts sentences and path-like tokens in the document summary and each group summary next to the existing dash and sentence-length lints.

[groups/lints.md](groups/lints.md)

### 05 Every expected.md rewritten from its pull request (`cases`)

Each expected.md follows the template in eval/review-criteria.md with Must, Good, Must not, and Notes written from the frozen sources, the diff, and the code at head, and its case.json loses claims and gains the pairs its Groups section implies.

Depends on:
- 01 expected.md is the source of the rubric lists (`rubric-lists`)

[groups/cases.md](groups/cases.md)