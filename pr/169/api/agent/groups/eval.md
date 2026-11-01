Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 5f50618caf4f4029e5dbba2aa5e83419842b8460` and `git rev-parse --verify 213dd6b92c2db8437786bfa0b20327632ea942bd` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 5f50618caf4f4029e5dbba2aa5e83419842b8460 213dd6b92c2db8437786bfa0b20327632ea942bd -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  5f50618caf4f4029e5dbba2aa5e83419842b8460

head               213dd6b92c2db8437786bfa0b20327632ea942bd

Named refs at pin: origin/t3/group-attention-164 ... HEAD

Read the diff:

git diff --find-renames 5f50618caf4f4029e5dbba2aa5e83419842b8460 213dd6b92c2db8437786bfa0b20327632ea942bd

Review concern 07 of 08: Eval: question Must nots and grader input (`eval`)

The why:

[#162](source:s1) asks for a Must-not entry, a question that a source answers.

The what:

Ten `expected.md` files gain a case-specific Must not for a question a source answers and two gain a Good entry for an open intent, while `packet.ts`, `checks.ts`, and `graders.ts` pass questions to the grader and the prose lint.

Attention (tradeoff):
`graders.ts` now lets a group question state a Must or Good fact. A question like "Why does X drop `Max-Age`?" also says that X drops it, so Must scores can rise a little against runs before this change.

Hunk refs for this concern:
- eval/cases/caddy-8015/expected.md
- eval/cases/cigster-99/expected.md
- eval/cases/cobra-2356/expected.md
- eval/cases/comprehende-57/expected.md
- eval/cases/flask-6096-planted/expected.md
- eval/cases/flask-6096/expected.md
- eval/cases/ruff-29024/expected.md
- eval/cases/ruff-29308/expected.md
- eval/cases/shadcn-10453/expected.md
- eval/cases/starship-6388/expected.md
- eval/cases/vitadeck-24/expected.md
- eval/review-criteria.md
- scripts/eval/checks.ts
- scripts/eval/graders.ts
- scripts/eval/packet.ts