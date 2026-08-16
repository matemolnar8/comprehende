# Comprehende

Local review assistant for git diffs. Groups changes by review concern and shows them in a fixed UI. Diffs always come from git in the repo you run the CLI in — never from the model, never stored in the review document. The review UI paints `git diff` output with [`@pierre/diffs`](https://diffs.com), the same renderer [T3 Code](https://github.com/pingdotgg/t3code) uses. Full file and blame views use Pierre’s file renderer from `git show` / `git blame`.

Product intent: [AGENTS.md](./AGENTS.md). Implementation plan: [PLAN.md](./PLAN.md).

## Install

Node.js 24+. Run the CLI **inside** the repository you want to review. There is no `--repo` flag.

```sh
npx comprehende@0.1.0 index --base origin/main
npx comprehende@0.1.0 validate --data review.json
npx comprehende@0.1.0 serve --data review.json --open
```

Pin the version. After a release, that version is on npm.

## Review a clone

```sh
git clone <url>
cd <repo>

npx comprehende@0.1.0 index --base origin/main
# write review.json from those hunk refs (the skill does this)

npx comprehende@0.1.0 validate --data review.json
npx comprehende@0.1.0 serve --data review.json --open
```

Three-dot range (`base...head`) is the merge-request / branch diff. `--base` defaults to `origin/HEAD` (or `main`/`master`). `--head` defaults to `HEAD`. `serve` binds `127.0.0.1` only and re-reads git on every request.

## Install the skill

From this checkout:

```sh
npx skills add ./ --skill comprehende
```

Once the package is on npm:

```sh
npx skills add matemolnar8/comprehende
```

The skill is the agent workflow: `index` → read the git diffs → write `review.json` (refs + summaries only) → `validate` → `serve`. It calls `npx comprehende@<version>` with the same version as `package.json`. Edit `src/schema/review.schema.json` or bump `version`, then run `pnpm sync:skill`. Tests fail if the pin, schema, or `.agents` copy drift.

## Commands

```
comprehende index [--base <ref>] [--head <ref>]
comprehende validate --data <review.json>
comprehende serve --data <review.json> [--port] [--open]
```

Defaults: `--head HEAD`, `--base` is `origin/HEAD` (or `main`/`master`).

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

`pnpm dev` and `pnpm exec` run with this package as cwd, so they only make sense when *this* repo is the one under review. To review a different project from a checkout, `cd` into it and run `npx comprehende@0.1.0` (or `node /path/to/comprehende/dist/cli/main.js` after `pnpm build`).

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
