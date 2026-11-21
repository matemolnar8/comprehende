Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify bfea60b652d3a4a9d23c54569fe13c8f235eaac7` and `git rev-parse --verify cf48b4ef0645b871d6bae89e128514b537713b0c` in this repository.
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

base (merge-base)  bfea60b652d3a4a9d23c54569fe13c8f235eaac7

head               cf48b4ef0645b871d6bae89e128514b537713b0c

Named refs at pin: origin/main ... origin/t3/add-theme-setup-cigster-demo

Read the diff:

git diff --find-renames bfea60b652d3a4a9d23c54569fe13c8f235eaac7 cf48b4ef0645b871d6bae89e128514b537713b0c

Commits:
- cf48b4ef Themes: stricter colour check, no first-paint flash, default shots ignore a home theme
- 3b2c7791 Skill: theme steps from two simulated cigster runs
- 6c14b4a2 Themes: a .comprehende/theme.json sets the UI colours

Sources:
- ticket #184
  https://github.com/matemolnar8/comprehende/issues/184
- pr PR #207 Theme file, skill setup flow, cigster demo.
  https://github.com/matemolnar8/comprehende/pull/207

The title:

Themes: one file gives the review UI a project's colours

The why:

[#184](source:s1) asks to let users customize the color scheme from a config file that the CLI and UI read deterministically.

The what (medium):

A `.comprehende/theme.json` sets the UI colours, and the skill can write one. Screenshot runs can also use a theme.

## Review concerns

### 01 Theme file and its check (`theme-file`)

`themeSchema` in `src/schema/theme.ts` defines the file, and `loadTheme` finds it in the repository root, else in the home folder, as [#184](source:s1) asks.

Attention (contract):
A value must be a literal colour: hex of 3, 4, 6, or 8 digits, or a colour function with numeric arguments. `{"dark":{"primary":"var(--brand)"}}` fails the parse, so a theme cannot point at the project's own variables. The repository file wins whole: a home file that sets `ring` gives nothing when the project file exists.

[groups/theme-file.md](groups/theme-file.md)

### 02 Theme in the review payload (`payload`)

`openReview` loads the theme beside the repository identity, and `reviewPayload` sends it as `theme`, so an export carries it in `api/review.json`.

Attention (risk):
`loadTheme` throws on an invalid file, and `openReview` lets the error through. A broken `~/.comprehende/theme.json` makes `serve` and `export` fail in every repository without a project theme, until the user fixes it. The error names the file and the field.

Depends on:
- 01 Theme file and its check (`theme-file`)

[groups/payload.md](groups/payload.md)

### 03 UI adopts the theme (`ui`)

`App` calls `applyCustomTheme` in a layout effect, which adopts one sheet that sets the variables over `styles.css` in each mode.

Attention (contract):
`--diff-canvas` is now `var(--card)` in `styles.css`. The built-in values match, so the default look stays the same, but a theme that sets `card` now also repaints the diff background unless it sets `diff-canvas` too.

Depends on:
- 02 Theme in the review payload (`payload`)

[groups/ui.md](groups/ui.md)

### 04 `theme` command (`cli`)

`comprehende theme` prints `ok <path>` or the two paths it looked at, and `serve` and `export` print the theme path they use.

Depends on:
- 01 Theme file and its check (`theme-file`)

[groups/cli.md](groups/cli.md)

### 05 Skill: set up a theme (`skill`)

`SKILL.md` sends a theme request to the new `references/theme.md`, before the refresh branch; that file maps a project's colours to the tokens and runs `theme`.

Attention (risk):
The theme steps run `<cli> theme`, but the skill pins `npx comprehende@0.13.4`, which has no `theme` command. Until the next release bumps the pin, the flow works only with a local executable.

Depends on:
- 04 `theme` command (`cli`)

[groups/skill.md](groups/skill.md)

### 06 Synced skill copies (`synced-skill`)

`pnpm sync:skill` copies the skill edits to `.agents/skills/comprehende/`. Skip them: they match `skills-next/` and the `check:skill` hook checks that.

[groups/synced-skill.md](groups/synced-skill.md)

### 07 Screenshots with a theme (`screenshots`)

`ui:screenshots --theme <file>` copies the file into the case repository as its theme. A run without the flag writes `{}` there, so a home theme cannot reach it.

[groups/screenshots.md](groups/screenshots.md)