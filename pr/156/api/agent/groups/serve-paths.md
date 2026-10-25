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

Review concern 01 of 07: serve accepts Windows paths (`serve-paths`)

Part: Windows support

The why:

On Windows, `serve` answered 400 invalid path for every page and file, so the UI did not load.

The what:

`resolveInsideRoot` in `src/git/repo.ts` compares the resolved path against the root plus the platform separator instead of `/`.

Hunk refs for this concern:
- src/git/repo.ts