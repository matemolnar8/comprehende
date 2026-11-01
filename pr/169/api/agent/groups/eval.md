Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify edf8493d0359215e44fbe8b801c108ca61c609a2` and `git rev-parse --verify 7916fd39239ca52f88e28f63adb77d7f4901a955` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames edf8493d0359215e44fbe8b801c108ca61c609a2 7916fd39239ca52f88e28f63adb77d7f4901a955 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  edf8493d0359215e44fbe8b801c108ca61c609a2

head               7916fd39239ca52f88e28f63adb77d7f4901a955

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames edf8493d0359215e44fbe8b801c108ca61c609a2 7916fd39239ca52f88e28f63adb77d7f4901a955

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