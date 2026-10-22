Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 2ef0a645c3de4340edc92ab04a1519a7801252ef` and `git rev-parse --verify b594a7c6ac4cfd391229272daf9b7b0ff53e5fa6` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 2ef0a645c3de4340edc92ab04a1519a7801252ef b594a7c6ac4cfd391229272daf9b7b0ff53e5fa6 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  2ef0a645c3de4340edc92ab04a1519a7801252ef

head               b594a7c6ac4cfd391229272daf9b7b0ff53e5fa6

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 2ef0a645c3de4340edc92ab04a1519a7801252ef b594a7c6ac4cfd391229272daf9b7b0ff53e5fa6

Review concern 02 of 02: Old UI config moves to tsconfig.app.json (`mechanical`)

The why:

The test project and the solution file need the UI options under a new name.

The what:

A pure rename with no content change. You can skip it.

Hunk refs for this concern:
- src/ui/tsconfig.json -> src/ui/tsconfig.app.json@0+0