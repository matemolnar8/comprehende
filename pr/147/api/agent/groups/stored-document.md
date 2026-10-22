Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 64c573619923b163e1bb2313bab69384ff71083e` and `git rev-parse --verify d86dd9523f70c2245948726ae8a7ea36aaf31b5f` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 64c573619923b163e1bb2313bab69384ff71083e d86dd9523f70c2245948726ae8a7ea36aaf31b5f -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  64c573619923b163e1bb2313bab69384ff71083e

head               d86dd9523f70c2245948726ae8a7ea36aaf31b5f

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 64c573619923b163e1bb2313bab69384ff71083e d86dd9523f70c2245948726ae8a7ea36aaf31b5f

Review concern 07 of 07: Hosted api/review.json holds the on-disk document (`stored-document`)

Part: Hosted document

The why:

The hosted Refresh path saves `api/review.json` `.document` as `review.json`, but its hunk refs were parsed objects, so the schema rejected it ([session](source:s2)).

The what:

`reviewPayload` sends `storedDocument(document)` typed as `StoredReviewDocument`, the UI parses the ref strings back in `fetchReview` with `parseStoredHunkRef` (moved from the schema to `identity.ts`), and `agent-md` lists the strings as they are.

Look for:
- Breaking: sites exported before this change still hold object hunk refs. `jq .document` from them still fails `validate` until the site is exported again.

Hunk refs for this concern:
- src/schema/identity.ts
- src/schema/review.ts@1+1
- src/schema/review.ts@225+228
- src/schema/review.ts@312+296
- src/schema/review.ts@373+357
- src/schema/types.ts
- src/review/write.ts
- src/api/types.ts@3+3
- src/api/types.ts@65+65
- src/api/live.ts@14+16
- src/api/live.ts@94+108
- src/ui/api.ts@9+9
- src/ui/api.ts@39+43
- src/api/agent-md.ts@1+1
- src/api/agent-md.ts@158+158
- src/api/agent-md.test.ts@160+160
- src/api/agent-md.test.ts@172+172
- src/api/export.test.ts@6+6
- src/api/export.test.ts@100+100