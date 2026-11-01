Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify edf8493d0359215e44fbe8b801c108ca61c609a2` and `git rev-parse --verify e9f4feaea4f6a3725324ae13159d13fcb53ef6c9` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames edf8493d0359215e44fbe8b801c108ca61c609a2 e9f4feaea4f6a3725324ae13159d13fcb53ef6c9 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  edf8493d0359215e44fbe8b801c108ca61c609a2

head               e9f4feaea4f6a3725324ae13159d13fcb53ef6c9

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames edf8493d0359215e44fbe8b801c108ca61c609a2 e9f4feaea4f6a3725324ae13159d13fcb53ef6c9

Review concern 04 of 07: Collapsed hunk and note pins (`ui`)

The why:

[#163](source:s1) asks a focused hunk to open on its range with one click to the whole hunk, and notes to show as lettered markers.

The what:

`focusPatch` in `focus.ts` cuts the file patch to the focused lines that `HunkView` renders under a `FocusBar`, and `PierreDiff` adds `NotePin` rows as line annotations.

Attention (tradeoff):
While any hunk of a file is cut, `HunkView` turns off hydration and `PierreDiff` shows `@@` headers between hunks instead of expandable gaps. A gap count would call hidden changed lines unmodified. "Show whole hunk" brings both back.

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