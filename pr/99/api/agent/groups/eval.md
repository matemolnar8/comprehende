Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a05aef85c489e9ccd5c42f7b3397219b35b95719` and `git rev-parse --verify 2ca6671769ee14d4160f11a194d09cf3afe58d25` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a05aef85c489e9ccd5c42f7b3397219b35b95719 2ca6671769ee14d4160f11a194d09cf3afe58d25 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a05aef85c489e9ccd5c42f7b3397219b35b95719

head               2ca6671769ee14d4160f11a194d09cf3afe58d25

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a05aef85c489e9ccd5c42f7b3397219b35b95719 2ca6671769ee14d4160f11a194d09cf3afe58d25

Review concern 03 of 03: Eval prompt and measurement (`eval`)

The why:

The new skill resolves refs in step 1. The eval producer must skip `npm view` without skipping that resolve, and the PR needs step and tool counts.

The what:

The producer prompt drops "in step 1". Agent runs record LLM steps and tool calls, and tests lock the skill wording and the prompt.

Look for:
- For a producer that still treats "skip the version check" as skip the first skill step, old eval wording skipped resolve. New wording names the npm check only.

Hunk refs for this concern:
- scripts/eval/agent.ts @@ -6,6 +6,11 @@
- scripts/eval/agent.ts @@ -32,7 +37,17 @@
- scripts/eval/agent.ts @@ -49,6 +64,11 @@
- scripts/eval/producer.test.ts @@ -0,0 +1,18 @@
- scripts/eval/producer.ts @@ -11,7 +11,7 @@
- scripts/eval/result.ts @@ -72,6 +72,10 @@
- scripts/eval/skill.test.ts @@ -5,7 +5,7 @@
- scripts/eval/skill.test.ts @@ -14,6 +14,35 @@
- src/schema/skill-sync.test.ts @@ -14,7 +14,7 @@