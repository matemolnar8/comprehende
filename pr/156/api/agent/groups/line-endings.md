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

Review concern 03 of 07: LF checkout and slash keys on every OS (`line-endings`)

Part: Windows support

The why:

Git for Windows defaults to `core.autocrlf=true`, and the skill sync and schema checks compare bytes, so they failed on every Windows checkout.

The what:

`.gitattributes` pins LF; `skill-sync.ts` keys its file maps with `/`, so the working tree and the staged tree compare equal; the pages test clones with `core.autocrlf=false`; CONTRIBUTING explains the `.claude/skills` symlink on Windows.

Look for:
- Subtle: a Windows clone made before this commit keeps its CRLF working files. `check:skill` still fails there until the files are checked out again.

Depends on:
- 01 serve accepts Windows paths (`serve-paths`)

Hunk refs for this concern:
- .gitattributes
- src/schema/skill-sync.ts
- scripts/pages-review.test.ts
- CONTRIBUTING.md