Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 6a72e43128d495024364329517b801647812ce40` and `git rev-parse --verify b84519867812a62c793e2a4b9b21a4978b1a5911` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 6a72e43128d495024364329517b801647812ce40 b84519867812a62c793e2a4b9b21a4978b1a5911 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  6a72e43128d495024364329517b801647812ce40

head               b84519867812a62c793e2a4b9b21a4978b1a5911

Named refs at pin: main ... HEAD

Read the diff:

git diff --find-renames 6a72e43128d495024364329517b801647812ce40 b84519867812a62c793e2a4b9b21a4978b1a5911

Review concern 01 of 05: Hunk ref strings (`contract`)

Part: File refs

The why:

[#94](source:s1) asks for a path string or path@oldStart+newStart in hunkRefs. The object form stays valid.

The what:

Parse accepts a path, a compact hunk, or a hunk object, and stores a normalized ref.

Look for:
- An object that omits oldStart still fails on oldStart. A path string and path@oldStart+newStart normalize before coverage sees them.

Hunk refs for this concern:
- src/schema/identity.ts
- src/schema/identity.test.ts
- src/schema/review.ts
- src/schema/parse.ts
- src/schema/parse.test.ts
- src/schema/types.ts
- src/schema/review.schema.json