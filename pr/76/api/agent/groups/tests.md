Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 30060c417b8961cba2924a994cf9b6a07213c674` and `git rev-parse --verify 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 30060c417b8961cba2924a994cf9b6a07213c674 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  30060c417b8961cba2924a994cf9b6a07213c674

head               15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8

Named refs at pin: 30060c417b8961cba2924a994cf9b6a07213c674 ... 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8

Read the diff:

git diff --find-renames 30060c417b8961cba2924a994cf9b6a07213c674 15b7ca8bf3767b65dc44625d98b1c1aa662e3bc8

Review concern 04 of 04: lookFor unit tests (`tests`)

Part: Tests

The why:

This file only proves the claim helpers. It could have been its own PR.

The what:

`look-for.test.ts` covers tags, buckets, dependsOn numbering, and source open targets.

Hunk refs for this concern:
- src/ui/lib/look-for.test.ts @@ -0,0 +1,251 @@