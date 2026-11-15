Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 463f7b51c9de30a6c08179ef8c33b1d501a0021e` and `git rev-parse --verify 3b56e697bae7030e2cfe3b2cfbd8a42268cbfdc3` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 463f7b51c9de30a6c08179ef8c33b1d501a0021e 3b56e697bae7030e2cfe3b2cfbd8a42268cbfdc3 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  463f7b51c9de30a6c08179ef8c33b1d501a0021e

head               3b56e697bae7030e2cfe3b2cfbd8a42268cbfdc3

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 463f7b51c9de30a6c08179ef8c33b1d501a0021e 3b56e697bae7030e2cfe3b2cfbd8a42268cbfdc3

Review concern 02 of 04: Repeated text cut (`trims`)

Part: Doc fixes

The what:

Text that repeated another doc or a file listing now points at the one place that owns it.

Depends on:
- 01 Claims the code contradicts (`fixes`)

Hunk refs for this concern:
- CONTRIBUTING.md
- AGENTS.md@35+35
- AGENTS.md@110+110
- docs/eval.md@4+4
- docs/eval.md@59+59
- docs/glossary.md@36+36