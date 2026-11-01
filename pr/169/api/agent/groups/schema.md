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

Review concern 01 of 08: Questions field, at most 2 (`schema`)

The why:

[#162](source:s1) asks for group `questions?: string[]`, at most 2. The type and `validate` both carry the limit.

The what:

`questionsSchema` in `review.ts` is a union of `[]`, `[q]`, and `[q, q]`, so `Questions` is a tuple type and a third question fails parse; `source.ts` checks citations in questions, and `parse.test.ts` pins the limit.

Attention (tradeoff):
The tuple union makes the JSON schema an `anyOf` of three tuples instead of `maxItems: 2`. Agents read that JSON schema in `references/review.schema.json`. Decide whether the typed limit is worth the noisier schema.

Hunk refs for this concern:
- src/schema/review.ts
- src/schema/types.ts
- src/schema/source.ts
- src/schema/parse.test.ts