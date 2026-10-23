# comprehende-57: Replace hand-rolled review parser with Zod

PR #57. No ticket, no comments. A refactor: one Zod 4 schema replaces the hand-written parser, the hand-written types, and the hand-written JSON Schema.

## Story

- Title: the PR title without the `[Cursor]` tag.
- Why: present, from the PR. The document shape had three copies (`parse.ts`, `types.ts`, `review.schema.json`), and `AGENTS.md` asks to parse at the boundary with the schema as the source of truth.
- Size: medium or large. Most lines are deleted parser code or regenerated JSON, but `review.ts` is a new contract that the parser, the types, and the JSON Schema all derive from.
- Parts: one story. The Zod dependency is part of that story, because the parser cannot work without it.
- Groups: 2 to 5.

## Groups

1. Zod schema replaces the parser: `src/schema/review.ts`, `src/schema/types.ts`, `src/schema/parse.ts`, `src/schema/parse.test.ts`. The schema, the inferred types that `types.ts` re-exports, the thin parse wrapper, and its test are one concern. A split into the schema with `types.ts`, then `parse.ts` with its test, is fine.
2. JSON Schema generation and drift test: `scripts/generate-review-schema.ts`, `src/schema/review.schema.test.ts`, the `generate:schema` hunk of `package.json`, and `src/schema/review.schema.json`. The script writes the file from `review.ts`, and the test fails when the committed file drifts.
3. Zod as a runtime dependency: the `dependencies` hunk of `package.json`, `scripts/pack-smoke.ts`, and the lockfile bucket. This group can merge into group 1.
4. Schema copies (mechanical, last): `skills-next/comprehende/references/review.schema.json` and `.agents/skills/comprehende/references/review.schema.json`. They are byte-identical to the canonical file. The canonical file can sit here instead of in group 2.

## Must

- The generated `review.schema.json` means the same as the old hand-written file, because only key order and `required` order change and `version` gains `"type": "number"`, so the reader can skip the three JSON diffs.
- Zod is the CLI's first runtime dependency, and `pack-smoke` now asserts that the packed `dependencies` are exactly `zod`, where before it asserted none.
- `parseReviewDocument` now fails on a `[text](source:id)` citation with an unknown id, because `documentRules` in `review.ts` calls `sourceCitationErrors`, which the old parser never called, so the PR's "citations stay" is new behavior at the parse step.

## Good

- `serve` and `export` now exit with `invalid review document` on an unknown citation id, where before `loadDocument` passed and `warnReview` only reported it while the command continued.
- The `sourceCitationErrors` call in `cmdValidate` can no longer report anything, because `loadDocument` fails on the same error first.
- Legacy `tickets` become `sources` in a `.transform` on `reviewDocumentSchema`, and the JSON Schema is built from `reviewDocumentObject`, so `tickets` stays out of the JSON Schema, which `review.schema.test.ts` checks.
- `isReviewSize` and `isSourceKind` in `types.ts` lose their last callers with the old parser and stay as unused exports.
- The `parseHunkRef` export goes away with the old parser, and no other module imported it.

## Must not

- Do not say the generated JSON Schema accepts different documents, or ask the reader to compare the three JSON diffs line by line.
- Do not call the legacy `tickets` TODO for 0.7.0 new, because it moved from the old `parse.ts` to `review.ts`.
- Do not say there is no test for unknown `patch` fields, because `parse.test.ts` has "rejects patch text fields".
- Do not repeat the PR claim that citation checks "stay" in the parser as fact, because the old parser did not check citations.
- Do not give the `types.ts` re-exports or `parse.test.ts` their own group, and do not put the Zod dependency in its own part.

## Notes

The citation claim is `Must` because the diff shows it on its own: the new `documentRules` calls `sourceCitationErrors`, the deleted `parse.ts` has no such call, and the new `parse.test.ts` case expects `unknown id "missing"`. Its effect on `serve`, `export`, and `validate` needs the callers in `src/cli/main.ts`, `src/cli/commands.ts`, and `src/api/live.ts`, which the diff does not touch, so those are `Good`.

The JSON Schema claim was checked by a key-by-key compare of base and head: the only differences are top-level key order, `required` order, and `version.type`. The two copies are byte-identical to the canonical file at base and at head.

Past runs missed the JSON Schema equivalence in 3 of 3 runs and the Zod dependency claim in 2 of 3. Older runs made 5 to 7 groups, most often by splitting `review.ts`, `parse.ts`, and `types.ts` apart.

`groups` is 2 to 5: group 3 can merge into group 1, and the canonical JSON can sit with the copies or with its generator. `parts` allows 0 or 1, because this is one story. `size` allows medium or large: the line count is mostly deletion and generated output, but `review.ts` is a contract that the other groups depend on.
