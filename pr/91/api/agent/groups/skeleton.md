Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff` and `git rev-parse --verify 8febfe58216a23b69f9e3f57c08518a67bafe9d4` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff 8febfe58216a23b69f9e3f57c08518a67bafe9d4 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff

head               8febfe58216a23b69f9e3f57c08518a67bafe9d4

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff 8febfe58216a23b69f9e3f57c08518a67bafe9d4

Review concern 01 of 06: Covering skeleton (`skeleton`)

The why:

[#84](source:s1) needs every hunk ref in a file without inventing a review. [Mate](source:s2) names that file a skeleton.

The what:

`skeletonDocument` copies every index hunk into one `ungrouped` group with stub prose. `cmdReview` writes that JSON and validates coverage.

Hunk refs for this concern:
- src/review/skeleton.ts @@ -0,0 +1,23 @@
- src/cli/commands.ts @@ -1,8 +1,11 @@
- src/cli/commands.ts @@ -17,6 +20,20 @@