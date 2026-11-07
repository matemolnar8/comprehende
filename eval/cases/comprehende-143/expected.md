# comprehende-143: Smaller diffs on mobile, plus an Iosevka toggle

PR #143. No ticket, one conversation comment. Two UI stories in one PR: diffs shrink and wrap on narrow screens, and a header toggle switches the mono font to a bundled Iosevka.

## Story

- Title: the PR title.
- Why: present or absent. The PR body gives the mobile problem (long lines cut off at the card edge) and no reason for the font toggle.
- Size: small or medium.
- Parts: two. The PR title says "plus"; the font toggle could have been its own PR. A third part is fine for the mobile file header when it sits apart.
- Groups: 2 to 4.

## Groups

1. Narrow-screen diffs: `src/ui/lib/narrow.ts`, `src/ui/lib/narrow.test.ts`, `src/ui/PierreDiff.tsx`, `src/ui/components/HunkView.tsx`, `src/ui/lib/gap-style.ts`, and the breakpoint rules in `src/ui/styles.css`. Smaller font and line height, default wrap, and a slimmer file header below 799px.
2. Iosevka toggle: `src/ui/lib/mono-font.ts`, `src/ui/lib/mono-font.test.ts`, `src/ui/lib/MonoFontProvider.tsx`, `src/ui/components/Header.tsx`, `src/ui/main.tsx`, `package.json`, `pnpm-lock.yaml`. The font choice, its store, the toggle, and the new `@fontsource/iosevka` dependency.

## Must

- Narrow screens wrap diff lines by default, and the user's wrap toggle still wins over that default.
- The mono font choice is stored in localStorage under `comprehende.mono-font`, with IBM Plex Mono as the default.
- The PR adds the `@fontsource/iosevka` dependency for the font toggle.
- The narrow-screen diff work and the font toggle are two parts, each with its own `parts[]` entry.

## Good

- The diff font size and line height step down at the same 799px breakpoint as the body text.

## Must not

- Do not put the font toggle in the same part as the narrow-screen diff changes.
- Do not add a `dependsOn` from the font toggle to the narrow-screen group.

## Notes

- This case checks that a PR whose title joins two features with "plus" gets two parts. `App.tsx`, `MobileShell.tsx` and `styles.css` can hold hunks of both stories, so they have no `together` or `apart` expect.
