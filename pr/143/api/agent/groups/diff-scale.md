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

Review concern 01 of 04: Diff text scales down on mobile (`diff-scale`)

Part: Mobile diff reading

The why:

The user asked that diffs follow the top sections' font size behavior on mobile [the session](source:s1).

The what:

styles.css steps --diff-font-size and --diff-line-height down at 799px, a diffs-container host rule carries them into Pierre, and the mobile gutter slims with them.

Look for:
- Subtle: Pierre reads font size on the diffs-container host. The --diffs-font-size rules on inner diff elements do nothing; the host rule in styles.css is the one that must carry the vars.

Hunk refs for this concern:
- src/ui/styles.css
- src/ui/PierreDiff.tsx
- src/ui/lib/gap-style.ts