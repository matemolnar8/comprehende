Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae` and `git rev-parse --verify 831ca5da9276ead82ada198ba2b928e62c3710f2` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae 831ca5da9276ead82ada198ba2b928e62c3710f2 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  3d282dc3d8e5a36190f501ab5d73fa0b9f138cae

head               831ca5da9276ead82ada198ba2b928e62c3710f2

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae 831ca5da9276ead82ada198ba2b928e62c3710f2

Review concern 01 of 07: Focus and note fields (`schema`)

The why:

[#163](source:s1) asks for `focus` ranges and `notes` on each group. The later groups read these fields.

The what:

`review.ts` adds `focus` and `notes` to the group schema, and `anchor.ts` finds the live hunk that holds a range or a note.

Attention (contract):
The 25-line cap, `end >= start`, and the three-note cap are zod checks in `review.ts`. So `serve` and `export` also refuse a document that breaks them, not only `validate`. Decide whether a bad range should block `serve`.

Hunk refs for this concern:
- src/schema/review.ts
- src/schema/types.ts
- src/schema/anchor.ts
- src/schema/source.ts
- src/schema/parse.test.ts