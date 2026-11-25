Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify bbce124d61e23582ed867bb81e87e81a6db86c92` and `git rev-parse --verify 21fcf69fc5df0599eb0f52a74e9da3f68ac0e5a5` in this repository.
   Done when both objects exist.

2. Choose the relevant review concerns.
   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.
   Done when every concern the question touches has its markdown loaded.

3. Answer from live git.
   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.
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

Commits:
- 21fcf69f Themes: name the colour choice ThemeChoice, and say where to switch it
- 91f342bf Themes: the Display menu switches between the project, user, and default colours

Sources:
- pr PR #210
  https://github.com/matemolnar8/comprehende/pull/210

The title:

Themes: the Display menu switches between the project, user, and default colours

The why:

With a project theme and a home theme, only the project one showed, and there was [no way back](source:s1) to the built-in colours.

The what (small):

The Display menu gets a Colours choice between the theme files and the built-in colours.

## Review concerns

### 01 Load both theme files (`load-both`)

`loadThemes` in `theme.ts` reads the repository file and the home file, and the payload sends both as `themes`. The `theme` command, `serve`, and `export` print one line per file they found.

Attention (risk):
`loadThemes` now always parses the home file, and an invalid file still throws. Before, a valid project theme meant the home file was never read; now a broken `~/.comprehende/theme.json` stops `serve` and `export` in every repository. The error names the file, as it did for the project file.

[groups/load-both.md](groups/load-both.md)

### 02 Colours choice in Display (`colours-menu`)

`DisplayMenu` lists each theme in `themes` plus Default, and `App` applies the theme `pickThemeChoice` resolves from the stored choice.

Attention (product):
The choice is one localStorage key per origin, not per repository. A stored User or Default wins over a project theme written later, so a fresh project theme does not show until the user picks Project. With no stored choice, the page starts on the first theme, as before this change.

Depends on:
- 01 Load both theme files (`load-both`)

[groups/colours-menu.md](groups/colours-menu.md)

### 03 Docs name the Colours choice (`docs`)

The README and the skill's theme reference say both files load and the Display menu switches between them. The `.agents` file is the `pnpm sync:skill` copy of the `skills-next` file, so skip it.

[groups/docs.md](groups/docs.md)