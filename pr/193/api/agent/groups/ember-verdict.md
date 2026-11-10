Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify b89c99e380695f042bc07f421e645c651d729635` and `git rev-parse --verify ecf9b77fd2f93f2c9a6e5814c3d50c832c0a38bb` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames b89c99e380695f042bc07f421e645c651d729635 ecf9b77fd2f93f2c9a6e5814c3d50c832c0a38bb -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  b89c99e380695f042bc07f421e645c651d729635

head               ecf9b77fd2f93f2c9a6e5814c3d50c832c0a38bb

Named refs at pin: origin/main ... ecf9b77f

Read the diff:

git diff --find-renames b89c99e380695f042bc07f421e645c651d729635 ecf9b77fd2f93f2c9a6e5814c3d50c832c0a38bb

Review concern 01 of 01: Ember verdict in eval docs (`ember-verdict`)

The what:

The paragraph states that Ember has no contributor variant, costs more on output, and fails on the subscription login, so the Spark contributor defaults stay.

Hunk refs for this concern:
- docs/eval.md