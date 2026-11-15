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

Review concern 01 of 04: Claims the code contradicts (`fixes`)

Part: Doc fixes

The what:

Each edited sentence now matches the code it names, such as `defaultBaseRef` trying `trunk` and the eval exit rule in `checks.ts`.

Hunk refs for this concern:
- README.md
- src/cli/args.ts
- .cursor/BUGBOT.md
- eval/review-criteria.md
- .github/workflows/eval.yml
- docs/glossary.md
- AGENTS.md@35+35
- AGENTS.md@80+80
- docs/eval.md@12+12