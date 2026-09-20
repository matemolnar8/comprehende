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

Review concern 03 of 06: Skeleton coverage tests (`tests`)

The why:

The success metric is every index hunk ref in the file, with no invented review prose.

The what:

Unit tests compare skeleton hunk refs to the index, reject missing `--data`, and the packed bin writes the same covering file.

Depends on:
- 02 review command (`cli`)

Hunk refs for this concern:
- src/review/skeleton.test.ts @@ -0,0 +1,67 @@
- src/cli/args.test.ts @@ -35,6 +35,21 @@
- src/cli/args.test.ts @@ -56,11 +71,14 @@
- scripts/pack-smoke.ts @@ -79,6 +79,24 @@
- src/schema/skill-sync.test.ts @@ -14,6 +14,7 @@