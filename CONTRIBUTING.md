# Contributing

## Develop

This repo uses [Vite+](https://viteplus.dev/). Install the global `vp` command once:

```sh
curl -fsSL https://vite.plus | bash
```

On Windows, run `irm https://vite.plus/ps1 | iex`. See the [Vite+ guide](https://viteplus.dev/guide/) for more.

`.claude/skills` is a symlink to `.agents/skills`. On Windows, git writes it as a plain text file unless it can make symlinks. To get the link, turn on Developer Mode, run `git config core.symlinks true`, delete `.claude/skills`, and run `git checkout -- .claude/skills`.

T3 Code worktrees need `vp` too. `t3.json` runs `node scripts/setup-worktree.ts` for each new worktree, and that script installs dependencies with `vp i`.

`pnpm build` writes `dist/cli` and `dist/ui`. `prepack` runs the build, so `pnpm pack` and `pnpm publish` always ship the UI.

`pnpm sync:skill` copies the JSON Schema into `skills-next/comprehende/`, pins `npx comprehende@<version>` there, and copies that tree to `.agents/skills/comprehende`. Agents in this checkout then use the next skill. It does not touch `skills/comprehende/`.

`pnpm dev` and `pnpm exec` run with this package as cwd, so they review this repo only. To review another project from a checkout, `cd` into it and run `node /path/to/comprehende/dist/cli/main.js` after `pnpm build`.

To use the next skill with the local CLI in any folder, install this checkout as the global skill:

```sh
pnpm dev:skill
```

It builds, copies `skills-next/comprehende/` to `~/.agents/skills/comprehende/`, and points the CLI pin at `node <checkout>/dist/cli/main.js`. Run it again after each rebuild, and after `npx skills update`, which restores the published skill.

## Serve and export

`serve` and `export` share one UI and one git payload. `serve` resolves the refs to commit SHAs at start, then builds the payloads from those objects on each request. `export` writes the same JSON and image bytes next to the UI.

This repository publishes exports to GitHub Pages. A pull request review is at `https://matemolnar8.github.io/comprehende/pr/<number>/`, and a named site is at `https://matemolnar8.github.io/comprehende/site/<name>/`. To enable Pages, open the repo's Settings > Pages, choose Deploy from a branch, branch `gh-pages`, folder `/`. A workflow deletes a pull request's folder when the pull request closes, and deletes sites older than 30 days, except `site/presentation/`.

## Refresh

`review` and `pregroup` record the commits the refs resolved to in `source.baseSha` and `source.headSha`. `refresh` resolves the refs again and then:

- keeps each hunk whose path and changed lines did not change, and moves its ref when only the start line moved
- keeps an edited hunk in its group and marks it changed, or reformat when only whitespace moved
- drops refs whose hunk left the diff
- puts hunks that no group covers into a draft `update` group

It prints the new commit subjects and one line per changed file, so the skill rewrites only the groups that changed. The old document stays beside the new one as `review.<old head>.json`, and `previous` names it; `serve` and `export` load it for the What changed page. `serve` and `export` print a note when the refs no longer resolve to the recorded commits.

## Release

Edit the skill in `skills-next/comprehende/`. `npx skills add` reads `skills/comprehende/` only.

Bump `version` in `package.json` when the CLI or UI changes, then run `pnpm sync:skill` so the next skill pin matches. Pre-commit and `vp test` fail if the staged package version and the next skill pin differ. Do not bump for skill-only edits. Use the number the user names. If they name none, use the next semver: patch for fixes, minor for new features, major for breaking changes.

When the next skill should ship with `npx skills add`, run `pnpm release:skill`. It copies `skills-next/comprehende/` onto `skills/comprehende/`. Run it in the same change that publishes a new CLI, so `npx skills add` installs instructions that match the package they pin.

Push to `main`. CI packs and tests the tarball on every change, and publishes the version if npm does not have it yet. Skill-only commits keep the same version, so they do not publish.

The first publish was manual (`pnpm publish --access public`) to claim the name. Later publishes use a GitHub Actions trusted publisher on npmjs.com for workflow `ci.yml`.

## Fixture

```sh
pnpm fixture
cd fixtures/repo
node ../../dist/cli/main.js serve --data ../example/review.json
```

`pnpm fixture` writes a small git repo to `fixtures/repo` (gitignored) and a refs-only `fixtures/example/review.json` with stories, lookFor, and sources. Run `serve` or `export` with cwd set to `fixtures/repo`.

To export a static copy from the same cwd:

```sh
node ../../dist/cli/main.js export --data ../example/review.json --out ../../fixtures/site
```

The folder holds the UI, frozen `api/*.json` payloads, and image bytes, with no git. Any static file server can host it:

```sh
python3 -m http.server --directory ../../fixtures/site 8080
```
