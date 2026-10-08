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

Review concern 01 of 06: Muse-only producer and graders (`runner`)

The why:

Evals run only in Muse Code, so the Cursor agent, probe, and fallback go away [muse-only evals](source:s1).

The what:

run.ts, producer.ts, and graders.ts call runMuseCodeAgent directly, and the shared result types plus the CLI-hunt check live in musecode.ts.

Hunk refs for this concern:
- scripts/eval/run.ts
- scripts/eval/producer.ts
- scripts/eval/graders.ts
- scripts/eval/constants.ts
- scripts/eval/musecode.ts
- scripts/eval/producer.test.ts
- scripts/eval/agent.ts
- scripts/eval/agent.test.ts
- scripts/eval/fallback.ts
- scripts/eval/fallback.test.ts
- scripts/eval/graders.test.ts@1+1
- package.json