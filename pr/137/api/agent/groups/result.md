Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 59f1ceb487f0bbfa730b2919a93d1fb33c8bec19` and `git rev-parse --verify ffd116fb87c2578ef771cde505ed2a73bc886eda` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 59f1ceb487f0bbfa730b2919a93d1fb33c8bec19 ffd116fb87c2578ef771cde505ed2a73bc886eda -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  59f1ceb487f0bbfa730b2919a93d1fb33c8bec19

head               ffd116fb87c2578ef771cde505ed2a73bc886eda

Named refs at pin: main ... feature/eval-musecode-only

Read the diff:

git diff --find-renames 59f1ceb487f0bbfa730b2919a93d1fb33c8bec19 ffd116fb87c2578ef771cde505ed2a73bc886eda

Review concern 04 of 06: Model-only reports (`result`)

The why:

Summaries name what the run used, and with one runner that is the model id.

The what:

result.ts and report.ts drop the agent fields and the fallback hint, and report.test.ts plus the remaining graders.test.ts hunks pin the new output.

Depends on:
- 01 Muse-only producer and graders (`runner`)

Hunk refs for this concern:
- scripts/eval/result.ts
- scripts/eval/report.ts
- scripts/eval/report.test.ts
- scripts/eval/graders.test.ts@88+87
- scripts/eval/graders.test.ts@125+124
- scripts/eval/graders.test.ts@145+143