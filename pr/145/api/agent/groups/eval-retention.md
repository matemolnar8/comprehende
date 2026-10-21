Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 50129928c7b33f461cd5fea07ee77b6ed7237fed` and `git rev-parse --verify 79d7f0b2167dcf8fa0eacf9191c454f9d3cb17f5` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 50129928c7b33f461cd5fea07ee77b6ed7237fed 79d7f0b2167dcf8fa0eacf9191c454f9d3cb17f5 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  50129928c7b33f461cd5fea07ee77b6ed7237fed

head               79d7f0b2167dcf8fa0eacf9191c454f9d3cb17f5

Named refs at pin: main ... HEAD

Read the diff:

git diff --find-renames 50129928c7b33f461cd5fea07ee77b6ed7237fed 79d7f0b2167dcf8fa0eacf9191c454f9d3cb17f5

Review concern 02 of 02: Eval artifact retention (`eval-retention`)

Part: Eval artifacts

The why:

Each eval run artifact stayed 90 days and filled the account-wide Actions storage [per the request](source:s1).

The what:

Adds `retention-days: 7` to the `Upload eval run` step. The step still runs on failed runs.

Hunk refs for this concern:
- .github/workflows/eval.yml