# comprehende-47: Replace tickets with first-class sources

PR #47, closes ticket #46. Three review comments from Máté, all addressed in the PR.

## Story

- Title: the PR title.
- Why: present, from #46. The reader cannot see where the why comes from.
- Size: large.
- Parts: one story. Groups: 5 to 7.

## Groups

1. Source schema and parser: `src/schema/types.ts`, `src/schema/parse.ts`, `src/schema/parse.test.ts`, `src/schema/source.ts`, `src/schema/source.test.ts`, `src/schema/review.schema.json`.
2. validate and serve check citations and pins: `src/review/pins.ts`, `src/review/pins.test.ts`, `src/cli/*`, `src/api/live.ts`, `src/api/types.ts`.
3. The prompt from "Ask an AI about this" lists sources: `src/api/agent-md.ts` and its test. This can merge with group 2.
4. Citations and the Sources row: `InlineMd.tsx`, `SourceCite.tsx`, `SourceList.tsx`, `Overview.tsx`, `GroupBrief.tsx`, `sources-context.tsx`, `inline-md.ts`, `source-display.ts`, `tooltip.tsx`.
5. Comment pins on the diff: `CommentPin.tsx`, `PierreDiff.tsx`, `HunkView.tsx`, `Group.tsx`, `App.tsx`, `Header.tsx`. This can merge with group 4.
6. Skill and docs: `skills-next/comprehende/SKILL.md`, `references/example.md`, `AGENTS.md`, `fixtures/pr32/review.json`.
7. Synced copies (mechanical): `.agents/skills/comprehende/*` and `skills-next/comprehende/references/review.schema.json`. All are identical to their source. They can also sit with their source.

## Must state

- validate fails on a source citation whose id is not in `sources`.
- Old documents with `tickets` still parse and become ticket sources. A document with both `tickets` and `sources` fails.
- A comment pin counts as matching live git when the file exists on that side and the line number is inside the file. validate does not check that the line is in a hunk or that its text is the same.
- The ticket asks for an external-link arrow in the Sources row. The change makes the label the link instead, as Máté's comment on `SourceList.tsx` asks.

## Good to state

- serve and export only warn on unknown citations and stale pins, the same as for hunk coverage.
- Once you jump to a pinned comment, that comment stays visible when comments are hidden. `focusCommentId` is never cleared.

## Must not

- Do not write a bullet for the `package.json` comment. It is resolved, and `package.json` is not in the diff.
- Do not add "PR says browser-tested, no automated UI tests" bullets.

## Baseline

- 6 of 6 runs stated the three old claims, so they did not separate good reviews from weak ones.
- 0 of 6 said what a matching pin means. 4 of 6 mentioned the label and arrow comment.
- Runs made 4 to 8 groups. Graders found few major issues.

## case.json

- `mechanicalPaths`: both synced schema copies. With one path the check always passed.
- `together`: `pins.ts` with `pins.test.ts`.
- Replaced the pin claim with the one on what a matching pin means. Added the arrow-to-label claim.
