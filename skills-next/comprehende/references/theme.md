# Theme

Give the review UI the colours of a project's design language. `<cli>` is the CLI command SKILL.md uses: the pinned `npx` command, or the local executable the user named.

The theme is one file, `.comprehende/theme.json`. The CLI reads it at the root of the repository under review, else in the home folder (`~/.comprehende/theme.json`); the repository file wins whole, and the two never merge. `serve` and `export` apply it, and an export carries it to the hosted page. Write the repository file unless the user asks for a theme for every repository.

```json
{
  "radius": "0.5rem",
  "light": { "background": "#f8fafc", "primary": "#d97706", "primary-foreground": "#ffffff" },
  "dark": { "background": "#0f172a", "primary": "#fbbf24", "primary-foreground": "#020617" }
}
```

Every key is optional. A token the file leaves out keeps the default colour. Each value is a literal colour: hex, or a colour function such as `rgb()`, `hsl()`, or `oklch()`. `radius` is a length in `rem` or `px`.

## Tokens

- **Surfaces:** `background` (the page), `card` (panels and the diff frame), `popover` (menus), `secondary`, `muted`, `accent` (quiet fills: chips, hover, the selected row), `border`, `input`.
- **Text:** `foreground`, `card-foreground`, `popover-foreground`, `secondary-foreground`, `accent-foreground`, and `muted-foreground` (secondary text).
- **Brand:** `primary` (links, the active item, buttons), `primary-foreground` (text on `primary`), `ring` (focus outline).
- **Meaning:** `add` and `del` (added and deleted lines and counts), `warn` (attention), `destructive` (errors), `moved` (moved lines).
- **Stories:** `strand-0` to `strand-5`, one colour per story in the overview.
- **Diff:** `diff-canvas`, `diff-fg`, `diff-add-line`, `diff-add-num`, `diff-add-word`, `diff-del-line`, `diff-del-num`, `diff-del-word`, `diff-hunk`, `diff-hover`.

## Steps

1. **Read the design language.** Find where the project defines its colours: CSS variables in a global stylesheet, a Tailwind `@theme` or config, a design-token file, or a component library theme. One `git grep` batch for definitions (`--background:`, `--primary:`, `@theme`, `colors:`), with vendored folders and lockfiles left out, finds them; a file that only reads `var(--primary)` is not a source. Read each defining file whole. When a value names a palette step from a package (`var(--color-slate-900)`, `amber-400`), read the colour from that package's source at the version the lockfile pins, such as its theme file in `node_modules`, or from its docs. Done when you can name the project's page, surface, text, border, and brand colours as literal values, and each mode it supports.

2. **Map the colours.** Give each surface, text, and brand token the project colour with the same role, and set `radius` to the project's radius. A token with no project colour takes the colour of the nearest role: `popover` from `card`. Write both `light` and `dark`. When the project has one mode, make the other from the same palette: mirror the palette's lightness scale (the darkest surface becomes the lightest, and text goes the other way), and keep the brand colour family, darker or lighter until it reads on the new page; `primary-foreground` flips with it. Keep `add` green and `del` red, because the reader takes them as added and deleted lines; set them, `strand-*`, and the `diff-*` tokens only when the project defines its own colours for those roles. `warn` marks attention and is amber by default; when `primary` is near amber, set `warn` to a hue apart from `primary`, `add`, `del`, and `destructive` in both modes, such as violet. Check contrast as WCAG ratios: 4.5:1 or more for each `*-foreground` on its surface, `muted-foreground`, `primary`, and `destructive` on `background`. Done when every value is a literal colour, each mode has its surface, text, and brand tokens, and each pair passes.

3. **Write and check.** Write the file with your edit tool, then run `<cli> theme`. On an error, fix the field it names and run `<cli> theme` again. Done when it prints `ok` and the path you wrote.

4. **Hand over.** Tell the user the path, and that the next `serve` or `export` uses it; an open `serve` shows it on reload. Committing the file shares the theme with everyone who reviews this repository.
