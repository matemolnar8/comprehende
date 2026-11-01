Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify b0813d8f6515448b400c20b7da21f2a33c0aa0e0` and `git rev-parse --verify 843230cb6e4245c73cf07b7fb1db23e79a77c5ba` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames b0813d8f6515448b400c20b7da21f2a33c0aa0e0 843230cb6e4245c73cf07b7fb1db23e79a77c5ba -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  b0813d8f6515448b400c20b7da21f2a33c0aa0e0

head               843230cb6e4245c73cf07b7fb1db23e79a77c5ba

Named refs at pin: origin/main ... t3/group-attention-164

Read the diff:

git diff --find-renames b0813d8f6515448b400c20b7da21f2a33c0aa0e0 843230cb6e4245c73cf07b7fb1db23e79a77c5ba

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