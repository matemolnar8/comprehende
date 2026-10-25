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

Review concern 07 of 07: Independent git reads run in parallel (`parallel-git`)

Part: Parallel git reads

The why:

Each git spawn costs about 100 ms on Windows, and `openReview` ran its reads one after another.

The what:

`openReview` in `live.ts` starts coverage, comment pins, commits, repo identity, and the previous review together; `readDiff` resolves base and head together; `staleCommentPins` checks every pin at once.

Look for:
- Perf: `staleCommentPins` starts one `git show` per pinned comment at the same moment, with no limit. A review with 200 pinned comments spawns 200 git processes at once.
- Subtle: when two reads in `openReview` fail, the error that reaches the caller is the first to reject in time, not the first in the old order.

Hunk refs for this concern:
- src/api/live.ts
- src/git/diff.ts
- src/review/pins.ts