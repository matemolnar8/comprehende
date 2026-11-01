Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ab3657b132459560b80abcec91c97929e6786a15` and `git rev-parse --verify 5f50618caf4f4029e5dbba2aa5e83419842b8460` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames ab3657b132459560b80abcec91c97929e6786a15 5f50618caf4f4029e5dbba2aa5e83419842b8460 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  ab3657b132459560b80abcec91c97929e6786a15

head               5f50618caf4f4029e5dbba2aa5e83419842b8460

Named refs at pin: origin/main ... t3/group-attention-164

Read the diff:

git diff --find-renames ab3657b132459560b80abcec91c97929e6786a15 5f50618caf4f4029e5dbba2aa5e83419842b8460

Review concern 06 of 08: Eval grades attention notes (`eval`)

The why:

[#164](source:s1) asks all 11 `expected.md` files to give each Must claim a home and to name findings, nits, and refactor ideas under Must not.

The what:

`claimBullets` in `graders.ts` hands the grader each document `lookFor` bullet and each attention note to check against head, and all 13 `expected.md` files gains a case-specific Must not and a note on where its Must claims live.

Attention (tradeoff):
The grader's bullets count now includes attention notes, and each case has one more Must not. Totals from runs before this change are not directly comparable, in exchange for grading every claim the review states as fact.

Depends on:
- 01 Attention in the schema (`schema`)

Hunk refs for this concern:
- scripts/eval/graders.ts
- scripts/eval/graders.test.ts
- scripts/eval/packet.ts
- scripts/eval/checks.ts
- scripts/eval/run.ts
- scripts/eval/report.ts
- scripts/eval/report.test.ts
- scripts/eval/args.ts
- eval/review-criteria.md
- docs/eval.md
- eval/cases/caddy-8015/expected.md
- eval/cases/cigster-99/expected.md
- eval/cases/cobra-2356/expected.md
- eval/cases/comprehende-50/expected.md
- eval/cases/comprehende-57/expected.md
- eval/cases/comprehende-59/expected.md
- eval/cases/flask-6096/expected.md
- eval/cases/ruff-29024/expected.md
- eval/cases/shadcn-10453/expected.md
- eval/cases/starship-6388/expected.md
- eval/cases/vitadeck-24/expected.md
- eval/cases/flask-6096-planted/expected.md@34+34
- eval/cases/flask-6096-planted/expected.md@42+43
- eval/cases/ruff-29308/expected.md