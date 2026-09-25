# comprehende-59: Mobile layout

PR #59. One Bugbot review comment, not addressed. The source ticket is #58, but neither the PR nor its commits link to it, so the skill cannot find it. The case keeps it out of the frozen sources on purpose.

## Story

- Title: the PR title.
- Why: absent. The PR says what changes, not why. The motive is only in #58, which nothing links. The case checks that the skill does not invent a motive from the patch.
- Size: medium.
- Parts: one story. Groups: 3 to 4.

## Groups

1. Mobile shell: `MobileShell.tsx`, the narrow branch in `App.tsx`, `src/ui/lib/narrow.ts`, `selectionCaption` in `selection.ts` with its test, the `ThemeToggle` export, compact `Sidebar`. The hook, the caption, and the sheet can be a foundation group before the shell.
2. Main pane moved into `ReviewStage.tsx`. The JSX is the same as before, with new props. This can merge with group 1 because `App.tsx` holds both.
3. Compact styles below 800px: the responsive class changes in `GroupBrief.tsx`, `Overview.tsx`, `Inspector.tsx`, `CopyPrompt.tsx`, `HunkView.tsx`, `Group.tsx`, `FileStrip` in `FileNav.tsx`, `styles.css`.
4. Sheet primitive: `src/ui/components/ui/sheet.tsx` (shadcn output), `@radix-ui/react-dialog` in `package.json`.

## Must state

- Bugbot says that hiding the "Viewed" label leaves a 14px tap target on phones. At head the label is still hidden.

## Good to state

- The PR says wrap, comments, and theme stay as icons. The mobile header also drops Refresh, the pinned range, and the coverage status. #58 asks to remove non-crucial elements, so this is intended, but the reader cannot see that from the PR. Without the coverage status, a phone reader does not see unassigned or stale counts.
- The desktop layout does not change. Each mobile style is either a `max-[799px]:` class or has a `min-[800px]:` value that restores the old one.
- The commits added three layouts behind `?design=` and then removed two. Only the overlay layout is at head.

## Must not

- Do not write a document why. "Make the review usable on phones" is a guess from the patch.
- Do not call the dropped header items a deviation. No available source asks to keep them.
- Do not claim a `?design=` switch exists.
- Do not make a group each for the hook, the caption, the stage, and the shell.

## Baseline

- 6 of 6 runs wrote a document why.
- 6 of 6 runs stated the Bugbot claim.
- 0 of 6 noted the dropped Refresh and coverage.
- Runs made 6 to 9 groups, the worst over-split of all cases.

## case.json

- `why` present to absent.
- `parts` max 3 to 1.
- `together`: `selection.ts` with `selection.test.ts`.
- `groups`: 2 to 4.
- Added the Bugbot claim.
