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

Review concern 04 of 08: Look closely mark and attention alert (`ui`)

The why:

[#164](source:s1) asks for a Look closely badge in the group nav and an alert between the summary and the hunks.

The what:

`Attention.tsx` gives `GroupBrief` its alert and `Sidebar` and `Overview` their Look closely mark, while `claims.ts` replaces the tag parser in `look-for.ts` and routes a source click to a document `lookFor` bullet or a group attention.

Attention (product):
The Overview group rows also show Look closely, beside the sidebar badge the issue asks for, because main has no triage lanes to list attentions in. Decide whether the mark belongs in both places.

Depends on:
- 03 Attention in the API payloads (`api`)

Hunk refs for this concern:
- src/ui/components/Attention.tsx
- src/ui/lib/claims.ts
- src/ui/lib/claims.test.ts
- src/ui/lib/look-for.ts
- src/ui/lib/look-for.test.ts
- src/ui/lib/use-claim-focus.ts
- src/ui/components/LookForList.tsx
- src/ui/components/GroupBrief.tsx
- src/ui/components/Overview.tsx
- src/ui/components/Sidebar.tsx
- src/ui/components/Changes.tsx
- src/ui/App.tsx
- src/ui/components/Group.tsx
- src/ui/components/ReviewStage.tsx
- src/test/covering-document.ts
- src/test/covering-document.test.ts
- scripts/fixture-smoke.ts