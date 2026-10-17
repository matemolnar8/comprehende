Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify b6874adce51508c7d7d48118445146e7b93d5d1a` and `git rev-parse --verify dab1e44dc86529cf9d3f90ebc62ec1c59e4a92dd` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames b6874adce51508c7d7d48118445146e7b93d5d1a dab1e44dc86529cf9d3f90ebc62ec1c59e4a92dd -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  b6874adce51508c7d7d48118445146e7b93d5d1a

head               dab1e44dc86529cf9d3f90ebc62ec1c59e4a92dd

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames b6874adce51508c7d7d48118445146e7b93d5d1a dab1e44dc86529cf9d3f90ebc62ec1c59e4a92dd

Review concern 03 of 04: File header gets quiet on mobile (`file-header`)

Part: Mobile diff reading

The why:

The file header crowded out the filename in the user's mobile screenshots [the session](source:s1).

The what:

The filename drops to 12px on narrow screens and the hunk count label hides there; the change counts stay.

Hunk refs for this concern:
- src/ui/components/HunkView.tsx