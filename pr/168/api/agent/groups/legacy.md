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

Review concern 02 of 08: Legacy lookFor in validate, refresh, and write (`legacy`)

The why:

[#164](source:s1) asks `validate` to fail group `lookFor` and `refresh` to name the groups that still need it converted.

The what:

`legacyLookForErrors` feeds `cmdValidate` and `reviewProblems`, `legacyLookForLine` ends the refresh report, and `storedDocument` writes the old field back so the skill can still read it.

Attention (tradeoff):
`storedDocument` puts legacy `lookFor` back on each group, in the file and in `api/review.json`, so a refresh from a hosted export can still convert it. The cost is that `StoredReviewDocument`, the UI's document type, carries an optional group `lookFor` the UI never renders.

Depends on:
- 01 Attention in the schema (`schema`)

Hunk refs for this concern:
- src/review/write.ts
- src/review/refresh.ts
- src/review/refresh.test.ts
- src/cli/commands.ts
- src/cli/main.ts
- src/api/live.ts