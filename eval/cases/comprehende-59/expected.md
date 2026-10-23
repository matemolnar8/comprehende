# comprehende-59: Mobile layout

PR #59. No linked ticket. One Bugbot review comment, not addressed at head. A UI change: a phone shell below 800px, an extracted main pane, and tighter type and spacing on small screens. The source ticket is #58, but neither the PR nor its commits link to it, so the frozen sources leave it out on purpose.

## Story

- Title: the PR title, "Mobile layout".
- Why: absent. The PR body and the two commits say what changes, not why. No available source states a problem or a goal.
- Size: medium. A new shell component and a moved main pane, plus small class changes across existing screens.
- Parts: none or one. It is one story.
- Groups: 2 to 5.

## Groups

1. Mobile shell: `src/ui/components/MobileShell.tsx`, the `narrow` branch in `src/ui/App.tsx`, `src/ui/lib/narrow.ts`, `selectionCaption` in `src/ui/lib/selection.ts` with its test in `src/ui/lib/selection.test.ts`, the `ThemeToggle` export in `src/ui/components/Header.tsx`, and the `compact` prop in `src/ui/components/Sidebar.tsx`. These are the pieces that replace the desktop header and sidebar below 800px. The hook and the caption can be a small foundation group before the shell.
2. Main pane moved into `src/ui/components/ReviewStage.tsx`. The JSX is the old `App.tsx` main pane with new props, and both layouts render it. It can merge with group 1 because `App.tsx` holds both.
3. Compact type and spacing below 800px: `src/ui/components/GroupBrief.tsx`, `src/ui/components/Overview.tsx`, `src/ui/components/Inspector.tsx`, `src/ui/components/CopyPrompt.tsx`, `src/ui/components/HunkView.tsx`, `src/ui/styles.css`, the `StackItem` classes in `Sidebar.tsx`, and `FileStrip` in `src/ui/components/FileNav.tsx` with its switch in `src/ui/components/Group.tsx`. They all use the same `max-[799px]:` or `min-[800px]:` pattern and read as one pass. `FileStrip` and `Group.tsx` can also sit with the shell, but they stay together.
4. Sheet primitive: `src/ui/components/ui/sheet.tsx` (shadcn output over `@radix-ui/react-dialog`) and the new dependency in `package.json`. It can be its own trailing group or sit with the shell that uses it.

## Must

- Bugbot says that hiding the "Viewed" label leaves only the `size-3.5` checkbox as a 14px tap target on phones, and at head `HunkView.tsx` still wraps the label text in `max-[799px]:hidden`.
- Below 800px `App.tsx` renders `MobileShell` instead of `Header`, so phones lose the base...head range, the coverage count with its unassigned and stale warning, the Refresh button, and the split toggle; only the groups button, the selection caption, wrap, comments, and theme stay.
- `ReviewStage.tsx` holds the main pane JSX that moved out of `App.tsx`, so it is a move with small prop changes (`compact` padding, `split && !narrow`), not new code.

## Good

- The PR claim "Desktop is unchanged" holds at head: each new class is either `max-[799px]:` or pairs with a `min-[800px]:` value that restores the old one, and `useNarrow` matches `(max-width: 799px)`.
- Below 800px `Group.tsx` hides the "N of M files viewed" line and `FileStrip` has no viewed toggle, so the small checkbox in `HunkView.tsx` is the only touch control to mark a file viewed.
- Split view is off on phones only through `effectiveSplit`; the stored `split` state stays, so a window that widens past 800px gets its split view back.
- The first commit adds three layouts (overlay, stack, dock) behind `?design=`, and the second commit removes stack, dock, and the switch, so only the overlay shell is at head.
- `ReviewStage` accepts a `className` prop that no caller passes.

## Must not

- Do not write a document why, such as "make the review usable on phones"; no available source states a motive.
- Do not call the dropped header items a deviation from a source; no available source asks to keep them.
- Do not say a `?design=` switch or the stack and dock layouts exist at head.
- Do not say the Bugbot tap target issue is fixed at head.
- Do not put the compact type and spacing changes, such as the body rule in `styles.css` or the `GroupBrief.tsx` sizes, in the `MobileShell` group, and do not make one group each for the hook, the caption, the stage, and the shell.

## Notes

The Bugbot claim is `Must` because the comment and the `HunkView.tsx` hunk show it on their own. The dropped header items are `Must` because `MobileShell.tsx` is new in the diff and the PR names only the kept icons, so a reader can assume the range and the coverage warning are still there. The `ReviewStage` move is `Must` because a reader who misses it reviews 95 lines as new code.

The viewed-control and split claims are `Good` because they need `Group.tsx`, `FileNav.tsx`, `HunkView.tsx`, and `App.tsx` read side by side. The desktop claim is `Good` because it confirms a PR claim that is true, and it needs every class change checked.

Past runs over-split (6 to 9 groups) and often put the `styles.css` body rule in the shell group. `groups` allows 2 because the shell, the stage, and the sheet can merge into one group beside the compact styles. `groups` allows 5 for a foundation group, the shell, the stage, the compact styles, and the sheet. `size` allows `large` because the stage and the shell are a new layout that later class changes lean on.
