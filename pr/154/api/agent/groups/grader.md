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

Review concern 02 of 05: One rubric grader call per case (`grader`)

The why:

The grouping and prose graders produced open-ended findings that measured grader verbosity as much as review quality [session](source:s1).

The what:

runRubricGrader in scripts/eval/graders.ts sends the packet plus the numbered lists and the review's lookFor bullets, and parseRubricReply zips the model's positional yes or no arrays back onto the item text that run.ts passes in.

Look for:
- The call is skipped when the rubric and the bullet list are both empty, so that case has no rubric.json and no must, good, mustNot, or bullets counts on its line.
- A reply with the wrong entry count is a parse error: the grader retries once with the reason appended, and a second failure records rubric parse FAIL with empty output instead of failing the case.
- The prompt caps work-tree reads at four files for the bullet checks. Search calls are not reads, so cigster-99 still made 6 to 8 tool calls per pass and 850k to 1.2M raw tokens, most of them cache reads of the 344 kB packet.
- --rescore now runs the grader, so it needs MUSE_CODE_API_KEY unless --no-graders is also passed. skillSection and readNextSkillMd in scripts/eval/skill.ts had no caller left and are gone.

Depends on:
- 01 expected.md is the source of the rubric lists (`rubric-lists`)

Hunk refs for this concern:
- scripts/eval/graders.ts
- scripts/eval/graders.test.ts
- scripts/eval/run.ts
- scripts/eval/args.ts
- scripts/eval/skill.ts
- scripts/eval/skill.test.ts
- docs/eval.md