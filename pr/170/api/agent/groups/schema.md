Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify edf8493d0359215e44fbe8b801c108ca61c609a2` and `git rev-parse --verify e9f4feaea4f6a3725324ae13159d13fcb53ef6c9` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames edf8493d0359215e44fbe8b801c108ca61c609a2 e9f4feaea4f6a3725324ae13159d13fcb53ef6c9 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  edf8493d0359215e44fbe8b801c108ca61c609a2

head               e9f4feaea4f6a3725324ae13159d13fcb53ef6c9

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames edf8493d0359215e44fbe8b801c108ca61c609a2 e9f4feaea4f6a3725324ae13159d13fcb53ef6c9

Review concern 01 of 07: Focus and note fields (`schema`)

The why:

[#163](source:s1) asks for `focus` and `notes` on each group. The later groups read these fields.

The what:

`review.ts` adds `focus` and `notes` to the group schema, and `anchor.ts` holds the helpers that find the hunk holding an anchor.

Attention (contract):
The 25-line cap, `end >= start`, and the three-note cap are zod checks in `review.ts`, so `serve` and `export` also refuse a document that breaks them. Only placement against live hunks waits for `validate`. Decide whether a bad range should block `serve`.

Hunk refs for this concern:
- src/schema/review.ts
- src/schema/types.ts
- src/schema/anchor.ts
- src/schema/source.ts
- src/schema/parse.test.ts