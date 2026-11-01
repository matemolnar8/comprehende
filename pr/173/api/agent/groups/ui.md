Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify de6c86b23284d2dc40e2633828c3854e1e8e6b1a` and `git rev-parse --verify 1308bb9768274e14fa889edd8d238870c3b9f39d` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames de6c86b23284d2dc40e2633828c3854e1e8e6b1a 1308bb9768274e14fa889edd8d238870c3b9f39d -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  de6c86b23284d2dc40e2633828c3854e1e8e6b1a

head               1308bb9768274e14fa889edd8d238870c3b9f39d

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames de6c86b23284d2dc40e2633828c3854e1e8e6b1a 1308bb9768274e14fa889edd8d238870c3b9f39d

Review concern 03 of 06: File header line (`ui`)

The why:

[PR #173](source:pr) asks for one muted line in the header the UI already shows, with no new block.

The what:

`Group` passes the note for each file to `HunkView`, which shows it in the header row the rename badge uses.

Depends on:
- 01 Schema and validate (`contract`)

Hunk refs for this concern:
- src/ui/components/Group.tsx
- src/ui/components/HunkView.tsx