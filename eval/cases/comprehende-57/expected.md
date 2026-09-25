# comprehende-57: Replace hand-rolled review parser with Zod

PR #57. No ticket, no comments.

## Story

- Title: the PR title without the `[Cursor]` tag.
- Why: present, from the PR. There were three copies of the document shape, and `AGENTS.md` asks to parse at the boundary from one schema.
- Size: medium. Most lines are deleted code or generated JSON.
- Parts: one story. Groups: 3 to 5.

## Groups

1. Zod schema replaces the parser: `src/schema/review.ts`, `src/schema/parse.ts`, `src/schema/types.ts`, `src/schema/parse.test.ts`. A split into the schema (with the `types.ts` re-exports), then the parse wrapper with its test, is fine: contract, then call site.
2. Schema generation and drift test: `scripts/generate-review-schema.ts`, `src/schema/review.schema.test.ts`, the `generate:schema` script.
3. Zod as a runtime dependency: `package.json` dependencies, `scripts/pack-smoke.ts`. `package.json` has two hunks, so it can be split or named in both groups.
4. Schema copies (mechanical, last): the two copies of `review.schema.json` under `skills-next/` and `.agents/`. The canonical `src/schema/review.schema.json` can sit here or with its generator and drift test.

## Must state

- The generated `review.schema.json` means the same as the old hand-written file. Only the key order changes, and `version` gets `"type": "number"`. The reader can skip the three JSON diffs.
- Zod is the CLI's first runtime dependency. `pack-smoke` now allows exactly `zod`.

## Good to state

- A new TODO says legacy `tickets` support goes away in 0.7.0.
- Other CLI error strings can change. Unknown `patch` fields and unknown source ids still fail (from the PR).

## Must not

- Do not add "confirm nothing out of scope is touched" bullets. The file list shows that.
- Do not give the type re-exports or the parse test their own group.
- Do not say there is no test for `patch` fields. `parse.test.ts` already has one.

## Baseline

- 1 of 6 runs said the generated schema means the same, and that run phrased it as a question.
- Runs made 5 to 7 groups. Most split `review.ts`, `parse.ts`, and `types.ts`.
- Document `lookFor` was padding in 6 of 6 runs: out-of-scope checks and "spot-check error strings".

## case.json

- `size` to medium or large.
- `mechanicalPaths`: the two schema copies. The canonical file may sit with its generator.
- `together`: `parse.ts` with `parse.test.ts`.
- `groups`: 2 to 5.
- Added two claims.
