Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify bbce124d61e23582ed867bb81e87e81a6db86c92` and `git rev-parse --verify 21fcf69fc5df0599eb0f52a74e9da3f68ac0e5a5` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames bbce124d61e23582ed867bb81e87e81a6db86c92 21fcf69fc5df0599eb0f52a74e9da3f68ac0e5a5 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  bbce124d61e23582ed867bb81e87e81a6db86c92

head               21fcf69fc5df0599eb0f52a74e9da3f68ac0e5a5

Named refs at pin: origin/main ... origin/t3/add-theme-picker-to-options-menu

Read the diff:

git diff --find-renames bbce124d61e23582ed867bb81e87e81a6db86c92 21fcf69fc5df0599eb0f52a74e9da3f68ac0e5a5

Review concern 02 of 03: Colours choice in Display (`colours-menu`)

The what:

`DisplayMenu` lists each theme in `themes` plus Default, and `App` applies the theme `pickThemeChoice` resolves from the stored choice.

Attention (product):
The choice is one localStorage key per origin, not per repository. A stored User or Default wins over a project theme written later, so a fresh project theme does not show until the user picks Project. With no stored choice, the page starts on the first theme, as before this change.

Depends on:
- 01 Load both theme files (`load-both`)

Hunk refs for this concern:
- src/ui/lib/custom-theme.ts
- src/ui/lib/custom-theme.test.ts
- src/ui/lib/ThemeProvider.tsx
- src/ui/App.tsx
- src/ui/components/DisplayMenu.tsx
- src/ui/components/Header.tsx
- src/ui/components/MobileShell.tsx