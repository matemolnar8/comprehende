Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 64c573619923b163e1bb2313bab69384ff71083e` and `git rev-parse --verify d86dd9523f70c2245948726ae8a7ea36aaf31b5f` in this repository.
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

base (merge-base)  64c573619923b163e1bb2313bab69384ff71083e

head               d86dd9523f70c2245948726ae8a7ea36aaf31b5f

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 64c573619923b163e1bb2313bab69384ff71083e d86dd9523f70c2245948726ae8a7ea36aaf31b5f

Commits:
- d86dd95 Add a What changed page that compares a refreshed review with the previous one

Sources:
- ticket #72 Show how groups, lookFor, sources, and summaries changed between two review documents for the same change, without a second code diff.
  https://github.com/matemolnar8/comprehende/issues/72
- transcript Claude Code session · Oct 22 The user picked a quiet What changed page out of several UX options, then asked to fix the hosted Refresh bug and to add tests that stop this kind of bug.

The title:

What changed: compare a refreshed review with the previous one

The why:

When a review is rewritten for the same change, the human may want to see how grouping and claims shifted ([#72](source:s1)).

The what (medium):

`refresh` keeps the old review beside the new one, and `serve` and `export` send a `changes` payload that the new What changed page shows. Separately, the hosted `api/review.json` now holds the document in its on-disk form, so the skill's hosted Refresh path can save it back.

Look for:
- Done differently: [#72](source:s1) asks to show regrouping as hunk membership shifts. The page lists files that moved in or out of a group and counts new, changed, and reformatted hunks per group; it does not list which hunk moved between two groups inside one file.
- The page is reachable only from a link at the end of the Overview kicker, the `h` key, and the `#changes` hash, as asked in the [session](source:s2). A review that was never refreshed shows none of them.

## Review concerns

### 01 refresh keeps the previous review (`keep-previous`)

`cmdRefresh` copies the old file to `review.<short head sha>.json` beside it and names that file in the new optional `previous` field; the CLI prints where it went.

[groups/keep-previous.md](groups/keep-previous.md)

### 02 The changes payload (`changes-payload`)

`openReview` loads the `previous` file next to the review path, and `changesPayload` compares prose, lookFor, sources, and group files by group id, with hunk counts from `matchHunks` over the old range.

Depends on:
- 01 refresh keeps the previous review (`keep-previous`)

[groups/changes-payload.md](groups/changes-payload.md)

### 03 export opens the review from its path (`export-path`)

`exportStaticSite` drops its `ctx` option, always opens the review from `dataPath`, and returns the context it used; the CLI, the eval runner, and the tests take it from the result, and a refresh test runs export and the `jq .document` round trip end to end.

Depends on:
- 02 The changes payload (`changes-payload`)

[groups/export-path.md](groups/export-path.md)

### 04 The What changed page (`changes-page`)

A new `changes` selection renders `Changes.tsx`, reached from a link in the Overview kicker, the `h` key in `App.tsx`, and the `#changes` hash, which falls back to the Overview when the review has no `changes`.

Depends on:
- 02 The changes payload (`changes-payload`)

[groups/changes-page.md](groups/changes-page.md)

### 05 The skill gives the #changes URL (`skill-link`)

Refresh step 5 tells the agent to end the URL with `#changes`. `.agents/skills/comprehende/SKILL.md` is a synced copy of the `skills-next` file; read one.

Depends on:
- 04 The What changed page (`changes-page`)

[groups/skill-link.md](groups/skill-link.md)

### 06 Generated schema JSON (`schema-json`)

The three files are identical and add the `previous` property. Skip them; `keep-previous` holds the source.

[groups/schema-json.md](groups/schema-json.md)

### 07 Hosted api/review.json holds the on-disk document (`stored-document`)

`reviewPayload` sends `storedDocument(document)` typed as `StoredReviewDocument`, the UI parses the ref strings back in `fetchReview` with `parseStoredHunkRef` (moved from the schema to `identity.ts`), and `agent-md` lists the strings as they are.

[groups/stored-document.md](groups/stored-document.md)