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

Review concern 03 of 08: Attention in the API payloads (`api`)

The why:

[#164](source:s1) asks agent-md for an `Attention:` block and What changed for an attention that was added, removed, or rewritten.

The what:

`ApiAttentionChange` lets `changesPayload` report an attention as added, removed, or rewritten, and `attentionBlock` writes it into each group's agent markdown.

Depends on:
- 01 Attention in the schema (`schema`)

Hunk refs for this concern:
- src/api/types.ts
- src/api/changes.ts
- src/api/changes.test.ts
- src/api/agent-md.ts
- src/api/agent-md.test.ts