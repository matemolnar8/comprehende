# Comprehende

Local review assistant for git diffs. Groups changes by review concern and shows them in a fixed UI. Diffs always come from git in the repo you run the CLI in — never from the model, never stored in the review document.

Product intent: [AGENTS.md](./AGENTS.md). Implementation plan: [PLAN.md](./PLAN.md).

## Status

Repo skeleton. CLI commands are stubs.

## Develop

Node.js 24 (current LTS) and [pnpm](https://pnpm.io/).

```sh
pnpm install
pnpm typecheck
pnpm dev -- --help
```

`pnpm build` emits `dist/`. The `comprehende` bin points at that output.

Run the CLI **inside** the repository you want to review. There is no `--repo` flag.

## Install the skill

From this checkout:

```sh
npx skills add ./ --skill comprehende
```

Once published:

```sh
npx skills add matemolnar8/comprehende
```

## Commands (planned)

```
comprehende index [--base <ref>] [--head <ref>]
comprehende validate --data <review.json>
comprehende serve --data <review.json> [--port] [--open]
```
