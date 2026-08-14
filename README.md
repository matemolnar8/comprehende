# Comprehende

Local review assistant for git diffs. Groups changes by review concern and shows them in a fixed UI. Diffs always come from git in the repo you run the CLI in — never from the model, never stored in the review document. The review UI paints `git diff` output with [`@pierre/diffs`](https://diffs.com), the same renderer [T3 Code](https://github.com/pingdotgg/t3code) uses. Full file and blame views use Pierre’s file renderer from `git show` / `git blame`.

Product intent: [AGENTS.md](./AGENTS.md). Implementation plan: [PLAN.md](./PLAN.md).

## Develop

Node.js 24 (current LTS) and [pnpm](https://pnpm.io/).

```sh
pnpm install
pnpm test
pnpm typecheck
pnpm build
pnpm sync:skill
pnpm dev -- --help
```

`pnpm build` emits `dist/cli` and `dist/ui`. The `comprehende` bin points at that output.

Run the CLI **inside** the repository you want to review. There is no `--repo` flag. To review a different project, `cd` into it and invoke the built binary by absolute path (or a global link):

```sh
# from this checkout
pnpm build

# from the repository under review
node /path/to/comprehende/dist/cli/main.js index --base origin/main
```

`pnpm dev` and `pnpm exec` run with this package as cwd, so they only make sense when *this* repo is the one under review.

## Review a clone

Clone the repo, `cd` into it, then index, write a review document, validate, and serve. There is no `--repo` flag — cwd is the clone. Diffs always come from git at serve time.

```sh
git clone <url>
cd <repo>

node /path/to/comprehende/dist/cli/main.js index --base origin/main
# write review.json from those hunk refs (the skill does this)

node /path/to/comprehende/dist/cli/main.js validate --data /tmp/review.json
node /path/to/comprehende/dist/cli/main.js serve --data /tmp/review.json --open
```

Three-dot range (`base...head`) is the merge-request / branch diff. `--base` defaults to `origin/HEAD` (or `main`/`master`). `--head` defaults to `HEAD`.

## Install the skill

From this checkout:

```sh
npx skills add ./ --skill comprehende
```

Once published:

```sh
npx skills add matemolnar8/comprehende
```

The skill is the agent workflow: `index` → read the git diffs → write `review.json` (refs + summaries only) → `validate` → `serve`. Edit `src/schema/review.schema.json` and run `pnpm sync:skill` so the copy in the skill folder stays identical.

## Commands

```
comprehende index [--base <ref>] [--head <ref>]
comprehende validate --data <review.json>
comprehende serve --data <review.json> [--port] [--open]
```

Defaults: `--head HEAD`, `--base` is `origin/HEAD` (or `main`/`master`). `serve` binds `127.0.0.1` only and re-reads git on every request.

## Fixture

```sh
pnpm fixture
cd fixtures/repo
node ../../dist/cli/main.js serve --data ../example/review.json
```

`pnpm fixture` writes a tiny git repo to `fixtures/repo` (gitignored) and a refs-only `fixtures/example/review.json`. Serve with cwd set to `fixtures/repo`.