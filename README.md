# Comprehende

Local review assistant for git diffs. Groups changes by review concern and shows them in a fixed UI. Diffs always come from git in the repo you run the CLI in — never from the model, never stored in the review document.

## Install the skill

```sh
npx skills add matemolnar8/comprehende
```

From this checkout:

```sh
npx skills add ./ --skill comprehende
```

## Develop

[pnpm](https://pnpm.io/).

```sh
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm pack:smoke
pnpm sync:skill
pnpm dev -- --help
```

`pnpm build` emits `dist/cli` and `dist/ui`. `prepack` runs that build, so `pnpm pack` / `pnpm publish` always ship the UI.

`pnpm dev` and `pnpm exec` run with this package as cwd, so they only make sense when _this_ repo is the one under review. To review a different project from a checkout, `cd` into it and run `npx comprehende@0.2.0` (or `node /path/to/comprehende/dist/cli/main.js` after `pnpm build`).

## Release

Bump `version` in `package.json` when the CLI or UI changes, then run `pnpm sync:skill` so the skill pin matches. Pre-commit and `pnpm test` fail if the staged package version and skill pin differ. Do not bump for skill-only edits.

Push to `main`. CI packs and tests the tarball on every change. If the version is not on npm yet, CI publishes it. Skill-only commits keep the same version, so they do not publish.

The first publish is manual (`pnpm publish --access public`) so you can claim the name. After that, add a GitHub Actions trusted publisher on npmjs.com for workflow `ci.yml`.

## Fixture

```sh
pnpm fixture
cd fixtures/repo
node ../../dist/cli/main.js serve --data ../example/review.json
```

`pnpm fixture` writes a tiny git repo to `fixtures/repo` (gitignored) and a refs-only `fixtures/example/review.json`. Serve with cwd set to `fixtures/repo`.
