Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82` and `git rev-parse --verify c77e82775e65bb5e490a77688e8ffd272829c18f` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82

head               c77e82775e65bb5e490a77688e8ffd272829c18f

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82 c77e82775e65bb5e490a77688e8ffd272829c18f

Commits:
- c77e827 Add per-story summaries under Overview part headers.

Sources:
- transcript Cursor session · Sep 19 Asks for document parts[] plus Overview column summaries, not Sidebar.

The title:

Add per-story summaries under Overview part headers

The why:

[The request](source:s1) asked for a document `parts` list and a one-sentence what under each Overview part header, not in the Sidebar.

The what (small):

Validate a document `parts[]` list that matches group `part`, and Overview shows that one-sentence what under each colored column title.

Look for:
- [The request](source:s1) says not to add the blurb to the Sidebar. `src/ui/components/Sidebar.tsx` has no part summary markup.

## Review concerns

### 01 Document parts array (`contract`)

`review.ts` adds `parts[]` and fails when a named group `part` has no matching entry, or a listed name is unused.

[groups/contract.md](groups/contract.md)

### 02 Cite sources in part summaries (`citations`)

`source.ts` walks `parts[].summary` for `source:` ids the same way it walks document and group prose.

Depends on:
- 01 Document parts array (`contract`)

[groups/citations.md](groups/citations.md)

### 03 Parse and schema tests (`schema-tests`)

`parse.test.ts` covers matching and failing `parts[]`, and `source.test.ts` includes `parts[0].summary` in citation walks.

Depends on:
- 01 Document parts array (`contract`)
- 02 Cite sources in part summaries (`citations`)

[groups/schema-tests.md](groups/schema-tests.md)

### 04 Skill writes parts[] (`skill`)

The next skill's what and grouping rules require a `parts[]` entry per `part`, and the example JSON has two.

Depends on:
- 01 Document parts array (`contract`)

[groups/skill.md](groups/skill.md)

### 05 Eval packet and prose lints (`eval-prose`)

The grading packet lists `parts[]`, and prose lints walk each part summary.

Depends on:
- 01 Document parts array (`contract`)

[groups/eval-prose.md](groups/eval-prose.md)

### 06 Generated schema and skill copies (`copies`)

`pnpm generate:schema` and `pnpm sync:skill` write the JSON Schema and the `.agents` skill tree.

[groups/copies.md](groups/copies.md)

### 07 Overview part header summary (`column`)

`PartColumn` looks up `document.parts` by name and renders the summary under the uppercase title, clamped to two lines.

[groups/column.md](groups/column.md)

### 08 partSummary lookup (`column-tests`)

`partSummary` returns the listed sentence for a titled part and nothing when the name is missing.

Depends on:
- 07 Overview part header summary (`column`)

[groups/column-tests.md](groups/column-tests.md)