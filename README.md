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
pnpm release:skill
pnpm dev -- --help
```

`pnpm build` emits `dist/cli` and `dist/ui`. `prepack` runs that build, so `pnpm pack` / `pnpm publish` always ship the UI.

`pnpm sync:skill` copies the JSON Schema into `skills-next/comprehende/`, pins `npx comprehende@<version>` there, and mirrors that tree into `.agents/skills/comprehende` so agents in this checkout use the next skill. It does not touch `skills/comprehende/`.

`comprehende serve` and `comprehende export` share one UI and one git payload layer. Serve computes those payloads on each request. Export writes the same JSON (and image bytes) next to the UI so any static file server can host the review.

`pnpm dev` and `pnpm exec` run with this package as cwd, so they only make sense when _this_ repo is the one under review. To review a different project from a checkout, `cd` into it and run `npx comprehende@0.4.0` (or `node /path/to/comprehende/dist/cli/main.js` after `pnpm build`).

## Release

Edit the skill in `skills-next/comprehende/`. `npx skills add` reads `skills/comprehende/` only.

Bump `version` in `package.json` when the CLI or UI changes, then run `pnpm sync:skill` so the next skill pin matches. Pre-commit and `pnpm test` fail if the staged package version and next skill pin differ. Do not bump for skill-only edits.

When that next skill should ship with `npx skills add`, run `pnpm release:skill`. That copies `skills-next/comprehende/` onto `skills/comprehende/`. Run it in the same change that publishes a new CLI. Then `npx skills add` installs instructions that match the package they pin.

Push to `main`. CI packs and tests the tarball on every change. If the version is not on npm yet, CI publishes it. Skill-only commits keep the same version, so they do not publish.

The first publish is manual (`pnpm publish --access public`) so you can claim the name. After that, add a GitHub Actions trusted publisher on npmjs.com for workflow `ci.yml`.

## Fixture

```sh
pnpm fixture
cd fixtures/repo
node ../../dist/cli/main.js serve --data ../example/review.json
```

Export a static copy (cwd still `fixtures/repo`):

```sh
node ../../dist/cli/main.js export --data ../example/review.json --out ../../fixtures/site
```

The folder has the UI plus frozen `api/*.json` payloads and image bytes. There is no git in that folder. Host it with any static file server:

```sh
python3 -m http.server --directory ../../fixtures/site 8080
```

`pnpm fixture` writes a tiny git repo to `fixtures/repo` (gitignored) and a refs-only `fixtures/example/review.json`. Serve or export with cwd set to `fixtures/repo`.
