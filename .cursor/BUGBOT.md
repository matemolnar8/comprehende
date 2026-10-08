# Review rules

Bugbot reads this file. Each rule here is a judgement call. A fixed pattern belongs in a check (`pnpm typecheck`, `pnpm test`, `actionlint` in CI), not in this file. PR numbers show where a rule came from.

## Smallest fix

- Fix a failure at its cheapest layer first: a config line, a CI install step, or a dependency flag. Write code only when that layer cannot hold the fix (#126 was one `apt-get install`).
- Test the cheapest hypothesis before reading vendor internals. Reading a minified bundle is the last step.
- A fix that adds more lines than the problem it removes needs a stated reason in the PR.

## PR matches its description

- The diff does what the PR body says. If the body says an expect or setting becomes a value, the file holds that value. Do not delete it (#92).
- A change that loosens an eval expect says what was wrong: the product, the harness, or the expect. One unstable run is not a reason (#115).
- A PR under `skills-next/comprehende/`, `src/schema/`, or `src/review/` has smoke eval summary lines in its body.
- A UI change has a screenshot or video in the PR body (#112).
- `package.json` `version` changes only in a release PR (#47).

## Git

- Parse git output with care. Quoted paths use C-style octal escapes, so `JSON.parse` is wrong for them (#113). Prefer `-z` output. Test a path with a space and a non-ASCII character.
- `a..b` is the commits in `b` and not in `a`. `a...b` in `git log` also counts commits on the `a` side. Pick the one that matches the intent (#68).
- Rename and copy entries have two paths. Check that blob, blame, and navigation lookups use the right one.

## Names and keys

- When code filters or prunes by a manifest, the lookup key must use the manifest's naming. Aliases and canonical IDs differ (`docker` and `dockerfile`). A miss must keep the item, not drop it (#133).
- When a sort or rank basis changes, rename the helpers and variables that carry the old meaning, and check each user of them (#75).

## Retries and shared files

- A retry loop must change something between tries. A swallowed failure (`allowFail`, an empty `catch`) hides a loop that cannot succeed (#67).
- When many runs write one shared file, rebuild it from a source of truth. Do not patch it in place.

## Eval harness

- Only `validate` and the expect checks change the exit code. A grader, packet, or export failure goes on `artifactError` (#68, #92).
- Lints are reported. They do not go in `failures` (#92).
- A missing expect field silently skips its check. Flag a case that drops one.
- No conflict markers in a checked-in file. A broken `case.json` fails every eval run (#116).

## CI and release

- The publish job needs npm 11.5 or newer, taken from `actions/setup-node`. `pnpm/setup` does not put npm on PATH. A version check must reject too-new majors as well as too-old ones (#61, #62).
- `secrets` is not readable in a step `if`. Copy it to `env` first (#125).

## Skill text

- Rules and examples in `skills-next/comprehende/` fit any git repository. They do not name this repo's layers, modules, or product.
- The skill does not list ecosystem file names, such as lockfiles. It takes them from the diff in front of it (#99).

## UI

- Build UI from shadcn primitives first (`components.json`). Check `npx shadcn@latest view <name>` before you hand-build a row, list, card, or item.
- Look at every screen the change touches at 1440px and about 900px before you push. A layout rule applied to one block must not squeeze its neighbours.
- A click target does not cover space that another handler owns. A `flex-1` button in a row takes the clicks of the empty gap (#120).
- Hiding a label must not shrink the tap target below a usable size on phones (#59).
- A toggle that turns a view off clears the state that view made, such as pins and focus. A later action that needs the view turns it back on (#48).
- A layer that floats over content, such as a popover or a citation card, has a shadow or an edge (#47).
- A control sits next to the thing it acts on. Prefer a clickable label to a button parked on the far side (#47).
