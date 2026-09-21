Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 18bd5cba8d77a1b2d462b98aece1d90746049f97` and `git rev-parse --verify 1eea21a29c94171869da0b89506e39b231b60999` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 18bd5cba8d77a1b2d462b98aece1d90746049f97 1eea21a29c94171869da0b89506e39b231b60999 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  18bd5cba8d77a1b2d462b98aece1d90746049f97

head               1eea21a29c94171869da0b89506e39b231b60999

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 18bd5cba8d77a1b2d462b98aece1d90746049f97 1eea21a29c94171869da0b89506e39b231b60999

Review concern 03 of 04: Packed bin uses the skeleton (`pack-smoke`)

The why:

The tarball path must prove `review` covers hunks without a public `index` bin.

The what:

The packed bin rejects `index` and validates the `review` skeleton.

Look for:
- Packed `review` writes group id `ungrouped`. Export markdown follows that id, not `all`.

Depends on:
- 01 Drop the public command (`cli`)

Hunk refs for this concern:
- scripts/pack-smoke.ts @@ -1,15 +1,13 @@
- scripts/pack-smoke.ts @@ -69,24 +67,22 @@
- scripts/pack-smoke.ts @@ -94,10 +90,9 @@
- scripts/pack-smoke.ts @@ -130,10 +125,10 @@