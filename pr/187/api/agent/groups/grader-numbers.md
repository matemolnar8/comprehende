Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify f344a7c5055f503935fbff52c8574fe1233bd93a` and `git rev-parse --verify 032d366a4596ab294a809d77bca9e8a85401b510` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames f344a7c5055f503935fbff52c8574fe1233bd93a 032d366a4596ab294a809d77bca9e8a85401b510 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  f344a7c5055f503935fbff52c8574fe1233bd93a

head               032d366a4596ab294a809d77bca9e8a85401b510

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames f344a7c5055f503935fbff52c8574fe1233bd93a 032d366a4596ab294a809d77bca9e8a85401b510

Review concern 03 of 06: Number bullet verdicts (`grader-numbers`)

Part: Read every file

The what:

The grader keys each bullet verdict by its number, because a count mismatch on this case threw away the whole rubric.

Attention (tradeoff):
`parseRubricReply` throws only on a missing number. A repeated `n` keeps its last verdict, and an `n` past the list is ignored, so a confused reply can still score. The two failed trials returned 125 for 119 and 128 for 122. Decide whether extras should fail.

Hunk refs for this concern:
- scripts/eval/graders.ts
- scripts/eval/graders.test.ts