Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae` and `git rev-parse --verify 40fb350b116d4142086135bae7691f55d33ea6b1` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae 40fb350b116d4142086135bae7691f55d33ea6b1 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  3d282dc3d8e5a36190f501ab5d73fa0b9f138cae

head               40fb350b116d4142086135bae7691f55d33ea6b1

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae 40fb350b116d4142086135bae7691f55d33ea6b1

Review concern 04 of 07: Collapsed hunk and note pins (`ui`)

The why:

[#163](source:s1) asks a focused hunk to open on its range with one click to the whole hunk, and notes to show as lettered agent notes.

The what:

`focusBlocks` in `focus.ts` turns a focused file into bars, diffs, and hidden-lines rows, which `HunkView` renders with `FocusBar`, `HiddenLines`, and one `PierreFileDiff` per diff; `NotePin` adds the lettered note rows.

Attention (tradeoff):
A file with a focus range renders one diff per block, with `hydrate` off and plain separator bars. Its gaps between hunks no longer expand, even after "Show whole hunk". Decide whether that cost is right for focused files.

Questions:
- Why does `focusBlocks` render the file whole, with no mark, when the patch's `@@` lines do not line up with its hunks?

Depends on:
- 01 Focus and note fields (`schema`)

Hunk refs for this concern:
- src/ui/lib/focus.ts
- src/ui/lib/focus.test.ts
- src/ui/components/FocusBar.tsx
- src/ui/components/NotePin.tsx
- src/ui/components/HunkView.tsx
- src/ui/components/Group.tsx
- src/ui/PierreDiff.tsx