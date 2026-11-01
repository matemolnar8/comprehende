Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ab3657b132459560b80abcec91c97929e6786a15` and `git rev-parse --verify 5f50618caf4f4029e5dbba2aa5e83419842b8460` in this repository.
   Done when both objects exist.

2. Choose the relevant review concerns.
   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.
   Done when every concern the question touches has its markdown loaded.

3. Answer from live git.
   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  ab3657b132459560b80abcec91c97929e6786a15

head               5f50618caf4f4029e5dbba2aa5e83419842b8460

Named refs at pin: origin/main ... t3/group-attention-164

Read the diff:

git diff --find-renames ab3657b132459560b80abcec91c97929e6786a15 5f50618caf4f4029e5dbba2aa5e83419842b8460

Commits:
- 5f50618 ruff-29308 gets the attention Must not and a Homes note
- 6bc908b Document lookFor names the instruction bullet from #166; flask-6096-planted gets the attention Must not
- 8617487 Keep legacy group lookFor in api/review.json too
- e33f8c4 Refresh names legacy lookFor groups even with nothing to refresh; What changed shows a new group's attention; source verdicts keep their fetch reason
- 3710802 Name attention in the review hint; an empty legacy lookFor needs no conversion
- 6284efe Skill, glossary, and eval: attention plus document lookFor
- 3f04597 Group attention replaces group lookFor

Sources:
- ticket #164 Replace group lookFor with one typed attention per group; keep document lookFor for source verdicts; legacy parse for old documents.
  https://github.com/matemolnar8/comprehende/issues/164
- pr PR #168 Replaces group lookFor with one typed attention per group across schema, CLI, UI, skill, and eval, and reports the full graded eval.
  https://github.com/matemolnar8/comprehende/pull/168

The title:

Group attention: one judgment call per group

The why:

[#164](source:s1) asks each group to hold at most one typed attention, the one call only the maintainer can make, instead of group `lookFor` findings with text tags only the UI parsed.

The what (large):

Group `lookFor` becomes one optional typed `attention` (`contract`, `tradeoff`, `product`, `risk`) through the schema, the CLI, the API, the UI, the skill, and the eval. Document `lookFor` stays for source verdicts, and old documents with group `lookFor` still load.

Look for:
- [#164](source:s1) asks the Overview triage lanes from #71 to list group attentions. Main has no lanes: commit `58c1302` removed group claims from Overview. The Overview group rows show the Look closely mark instead.

## Review concerns

### 01 Attention in the schema (`schema`)

`review.ts` adds `attentionSchema` with a `kind` from `ATTENTION_KINDS`, and the input schema turns an old group `lookFor` into `legacyLookFor` that `legacyLookForErrors` names.

Attention (contract):
A `review.json` with group `lookFor` still parses, so `serve` and `export` show it with a warning. `validate` now exits 1 on it until each group's `lookFor` becomes `attention` or goes. Decide whether old documents need nothing more than that message.

[groups/schema.md](groups/schema.md)

### 02 Legacy lookFor in validate, refresh, and write (`legacy`)

`legacyLookForErrors` feeds `cmdValidate` and `reviewProblems`, `legacyLookForLine` ends the refresh report, and `storedDocument` writes the old field back so the skill can still read it.

Attention (tradeoff):
`storedDocument` puts legacy `lookFor` back on each group, in the file and in `api/review.json`, so a refresh from a hosted export can still convert it. The cost is that `StoredReviewDocument`, the UI's document type, carries an optional group `lookFor` the UI never renders.

Depends on:
- 01 Attention in the schema (`schema`)

[groups/legacy.md](groups/legacy.md)

### 03 Attention in the API payloads (`api`)

`ApiAttentionChange` lets `changesPayload` report an attention as added, removed, or rewritten, and `attentionBlock` writes it into each group's agent markdown.

Depends on:
- 01 Attention in the schema (`schema`)

[groups/api.md](groups/api.md)

### 04 Look closely mark and attention alert (`ui`)

`Attention.tsx` gives `GroupBrief` its alert and `Sidebar` and `Overview` their Look closely mark, while `claims.ts` replaces the tag parser in `look-for.ts` and routes a source click to a document `lookFor` bullet or a group attention.

Attention (product):
The Overview group rows also show Look closely, beside the sidebar badge the issue asks for, because main has no triage lanes to list attentions in. Decide whether the mark belongs in both places.

Depends on:
- 03 Attention in the API payloads (`api`)

[groups/ui.md](groups/ui.md)

### 05 Skill: Attention plus document lookFor (`skill`)

The `lookFor` section of `SKILL.md` splits into Attention and a document-only `lookFor` that also names the instruction bullet from #166, and the steps, Refresh step 4, and `example.md` follow; the `.agents/skills` copies are identical synced output.

Attention (product):
Behavior changes that ask for no decision now go in the group `summary`, and bugs, missing tests, nits, and refactor ideas go nowhere. A finding that past runs wrote as a group `lookFor` bullet can now be absent from the review. Decide whether that loss is the intended scope.

Depends on:
- 01 Attention in the schema (`schema`)

[groups/skill.md](groups/skill.md)

### 06 Eval grades attention notes (`eval`)

`claimBullets` in `graders.ts` hands the grader each document `lookFor` bullet and each attention note to check against head, and all 13 `expected.md` files gains a case-specific Must not and a note on where its Must claims live.

Attention (tradeoff):
The grader's bullets count now includes attention notes, and each case has one more Must not. Totals from runs before this change are not directly comparable, in exchange for grading every claim the review states as fact.

Depends on:
- 01 Attention in the schema (`schema`)

[groups/eval.md](groups/eval.md)

### 07 Glossary and contributor docs (`docs`)

`docs/glossary.md` defines Attention and narrows Look for to source verdicts, and `AGENTS.md` and `CONTRIBUTING.md` name attention where they list the fields the skill fills.

[groups/docs.md](groups/docs.md)

### 08 Generated JSON Schema (`schema-json`)

The three `review.schema.json` files are the same generated output: group `lookFor` becomes `attention` and the document `lookFor` description names source verdicts, so the reader can skip them.

Depends on:
- 01 Attention in the schema (`schema`)

[groups/schema-json.md](groups/schema-json.md)