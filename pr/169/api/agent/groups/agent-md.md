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

Review concern 02 of 08: Questions in agent markdown and the prompt (`agent-md`)

The why:

[#162](source:s1) asks for a `Questions:` block in `agent-md.ts` and a button prompt that reuses `agentClipboardPrompt`.

The what:

`live.ts` puts `questions` on each `ApiReview` group, `questionsBlock` prints them in the group and overview markdown, and `agentClipboardPrompt(url, question?)` appends one question after the URL.

Depends on:
- 01 Questions field, at most 2 (`schema`)

Hunk refs for this concern:
- src/api/types.ts
- src/api/live.ts
- src/api/agent-md.ts
- src/api/agent-md.test.ts
- src/ui/lib/agent-prompt.ts
- src/test/covering-document.ts
- scripts/fixture-smoke.ts