# comprehende-59: Mobile layout

PR #59. No ticket. One Bugbot review comment, not addressed.

## Story

- Title: the PR title.
- Why: open question. The PR says what changes but not why. A strict reading of the skill gives no document why. "Make the review usable on phones" is implied, not stated.
- Size: medium.
- Parts: one story. Groups: 3 to 4.

## Groups

1. Mobile shell: `MobileShell.tsx`, the narrow branch in `App.tsx`, `src/ui/lib/narrow.ts`, `selectionCaption` in `selection.ts` with its test, the `ThemeToggle` export, compact `Sidebar`.
2. Main pane moved into `ReviewStage.tsx`. The JSX is the same as before, with new props. This can merge with group 1 because `App.tsx` holds both.
3. Compact styles below 800px: the responsive class changes in `GroupBrief.tsx`, `Overview.tsx`, `Inspector.tsx`, `CopyPrompt.tsx`, `HunkView.tsx`, `Group.tsx`, `FileStrip` in `FileNav.tsx`, `styles.css`.
4. Sheet primitive: `src/ui/components/ui/sheet.tsx` (shadcn output), `@radix-ui/react-dialog` in `package.json`.

## Must state

- Bugbot says that hiding the "Viewed" label leaves a 14px tap target on phones. At head the label is still hidden.
- The PR says wrap, comments, and theme stay as icons. The mobile header also drops Refresh, the pinned range, and the coverage status.

## Good to state

- The desktop layout does not change. Each mobile style is either a `max-[799px]:` class or has a `min-[800px]:` value that restores the old one.
- The commits added three layouts behind `?design=` and then removed two. Only the overlay layout is at head.

## Must not

- Do not claim a `?design=` switch exists.
- Do not make a group each for the hook, the caption, the stage, and the shell.

## Baseline

- 6 of 6 runs stated the Bugbot claim.
- 0 of 6 noted the missing Refresh and coverage.
- Runs made 6 to 9 groups, the worst over-split of all cases.

## case.json

- Removed the `why` expect until the question is answered.
- `parts` max 3 to 1.
- `together`: `MobileShell.tsx`, `narrow.ts`, `selection.ts`.
- Added two claims.
