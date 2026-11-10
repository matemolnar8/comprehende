Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify b89c99e380695f042bc07f421e645c651d729635` and `git rev-parse --verify 9e1e2db362adb7b58120bee612233ed6ac2a7d9f` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames b89c99e380695f042bc07f421e645c651d729635 9e1e2db362adb7b58120bee612233ed6ac2a7d9f -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  b89c99e380695f042bc07f421e645c651d729635

head               9e1e2db362adb7b58120bee612233ed6ac2a7d9f

Named refs at pin: origin/main ... 9e1e2db3

Read the diff:

git diff --find-renames b89c99e380695f042bc07f421e645c651d729635 9e1e2db362adb7b58120bee612233ed6ac2a7d9f

Review concern 01 of 03: Contributor mode per model (`contributor-mode`)

The what:

A new contributorMode helper passes contributor mode on for muse-spark contributor variants and Muse Wonder, and off for other models, so Ember runs on the subscription instead of failing.

Hunk refs for this concern:
- scripts/eval/musecode.ts
- scripts/eval/musecode.test.ts