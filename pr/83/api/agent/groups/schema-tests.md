Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82` and `git rev-parse --verify c77e82775e65bb5e490a77688e8ffd272829c18f` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82 c77e82775e65bb5e490a77688e8ffd272829c18f -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82

head               c77e82775e65bb5e490a77688e8ffd272829c18f

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82 c77e82775e65bb5e490a77688e8ffd272829c18f

Review concern 03 of 08: Parse and schema tests (`schema-tests`)

Part: Schema

The why:

The contract needs tests for matching names, orphans, duplicates, empty summaries, and the skill example.

The what:

`parse.test.ts` covers matching and failing `parts[]`, and `source.test.ts` includes `parts[0].summary` in citation walks.

Depends on:
- 01 Document parts array (`contract`)
- 02 Cite sources in part summaries (`citations`)

Hunk refs for this concern:
- src/schema/parse.test.ts @@ -1,6 +1,10 @@
- src/schema/parse.test.ts @@ -62,13 +66,14 @@
- src/schema/parse.test.ts @@ -79,11 +84,109 @@
- src/schema/review.schema.test.ts @@ -21,6 +21,7 @@
- src/schema/source.test.ts @@ -90,12 +90,13 @@