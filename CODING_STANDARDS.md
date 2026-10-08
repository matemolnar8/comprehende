# Coding standards

The reviewer reads this file. Implementers read `AGENTS.md`. Each rule here is a judgement call. A fixed pattern belongs in a check (`pnpm typecheck`, `pnpm test`, `actionlint` in CI), not in this file.

## Smallest fix

- Fix a failure at its cheapest layer first: a config line, a CI install step, or a dependency flag. Write code only when that layer cannot hold the fix.
- Test the cheapest hypothesis before reading vendor internals. Reading a minified bundle is the last step.
- A fix that adds more lines than the problem it removes needs a stated reason in the PR.

## Skill text

- Rules and examples in `skills-next/comprehende/` fit any git repository. They do not name this repo's layers, modules, or product.

## UI

- Build UI from shadcn primitives first (`components.json`). Check `npx shadcn@latest view <name>` before you hand-build a row, list, card, or item.
- Look at every screen the change touches at 1440px and about 900px before you push. A layout rule applied to one block must not squeeze its neighbours.
- A click target does not cover space that another handler owns.
