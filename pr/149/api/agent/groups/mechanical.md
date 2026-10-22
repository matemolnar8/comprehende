Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 36118c1676746e323b265ebc0ebdebb7db1c88e2` and `git rev-parse --verify b4c1ba2871ee5a36e4ba71f77ec63a535ea67317` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 36118c1676746e323b265ebc0ebdebb7db1c88e2 b4c1ba2871ee5a36e4ba71f77ec63a535ea67317 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  36118c1676746e323b265ebc0ebdebb7db1c88e2

head               b4c1ba2871ee5a36e4ba71f77ec63a535ea67317

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 36118c1676746e323b265ebc0ebdebb7db1c88e2 b4c1ba2871ee5a36e4ba71f77ec63a535ea67317

Review concern 03 of 03: Old UI config moves to tsconfig.app.json (`mechanical`)

The why:

The test project and the solution file need the UI options under a new name.

The what:

A pure rename with no content change. You can skip it.

Hunk refs for this concern:
- src/ui/tsconfig.json -> src/ui/tsconfig.app.json@0+0