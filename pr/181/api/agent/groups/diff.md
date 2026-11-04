Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 587e7aebf3074a2288cf7bee6eacfddba4bb3073` and `git rev-parse --verify bb865b7baa24a3c16de3c9282e41c4d095c15628` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 587e7aebf3074a2288cf7bee6eacfddba4bb3073 bb865b7baa24a3c16de3c9282e41c4d095c15628 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  587e7aebf3074a2288cf7bee6eacfddba4bb3073

head               bb865b7baa24a3c16de3c9282e41c4d095c15628

Named refs at pin: 587e7aeb ... bb865b7b

Read the diff:

git diff --find-renames 587e7aebf3074a2288cf7bee6eacfddba4bb3073 bb865b7baa24a3c16de3c9282e41c4d095c15628

Review concern 05 of 08: Diff cards (`diff`)

The why:

The design reviews in the [session](source:s2) ask for calmer diff cards and code that is easy to read in both themes.

The what:

`HunkView` frames each file's `PierreDiff`, whose CSS strings come from `gap-style.ts`, `syntax-theme.ts`, and the moved-line rules, and whose gaps and focus bars come from `hunk-gaps.ts` and `focus.ts`.

Attention (tradeoff):
`resolveWrap` in `narrow.ts` now returns `true` when no toggle is set; before, only narrow screens wrapped. Long code lines wrap on desktop too, and so do markdown tables, which lose their column alignment. Pierre sets wrap per file, so no file type can opt out.

Depends on:
- 01 Shared controls and tokens (`controls`)

Hunk refs for this concern:
- src/ui/components/HunkView.tsx
- src/ui/PierreDiff.tsx
- src/ui/components/FocusBar.tsx
- src/ui/components/NotePin.tsx
- src/ui/components/CommentPin.tsx
- src/ui/components/MovedChip.tsx
- src/ui/lib/focus.ts
- src/ui/lib/focus.test.ts
- src/ui/lib/hunk-gaps.ts
- src/ui/lib/relocation.ts
- src/ui/lib/relocation.test.ts
- src/ui/lib/gap-style.ts
- src/ui/lib/syntax-theme.ts
- src/ui/lib/syntax-theme.test.ts
- src/ui/lib/narrow.ts
- src/ui/lib/narrow.test.ts
- src/ui/lib/theme.ts