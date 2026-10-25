Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 7346f9664030764a93e78942373251c29a5f4803` and `git rev-parse --verify a476ce89308f686f4349f0c94cb750a094e8b51b` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 7346f9664030764a93e78942373251c29a5f4803 a476ce89308f686f4349f0c94cb750a094e8b51b -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  7346f9664030764a93e78942373251c29a5f4803

head               a476ce89308f686f4349f0c94cb750a094e8b51b

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 7346f9664030764a93e78942373251c29a5f4803 a476ce89308f686f4349f0c94cb750a094e8b51b

Review concern 02 of 07: Read review.json in PowerShell encodings (`encodings`)

Part: Windows support

The why:

PowerShell 5.1 writes UTF-8 with a BOM, and its `>` writes UTF-16LE, so `validate` and `serve` rejected those files as invalid JSON.

The what:

`loadDocument` reads bytes and `decodeText` picks UTF-16LE from its BOM, else UTF-8 with the BOM dropped; the test writes all three encodings.

Depends on:
- 01 serve accepts Windows paths (`serve-paths`)

Hunk refs for this concern:
- src/review/load.ts
- src/review/load.test.ts