Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 95879630ef53ba6bd6da25c6958a19fe06786fe0` and `git rev-parse --verify 25c1447e9c9388f263b685a884edb25c8b7bde9b` in this repository.
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

base (merge-base)  95879630ef53ba6bd6da25c6958a19fe06786fe0

head               25c1447e9c9388f263b685a884edb25c8b7bde9b

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 25c1447e9c9388f263b685a884edb25c8b7bde9b

Commits:
- 25c1447 Treat remapped source hrefs as the same claim
- de61188 Merge remote-tracking branch 'origin/main' into cursor/compare-reviews-d8c5
- 0e0d850 Add compare for two review documents

Sources:
- ticket #72 Compare two review JSON documents. Show added, removed, retitled, and regrouped groups, plus lookFor, sources, and summaries. Do not invent a second code-diff view.
  https://github.com/matemolnar8/comprehende/issues/72
- pr PR #77 Initial version of #72. compare --from/--to, --json, and --open. Matching by id, title, then hunk overlap. SKILL.md unchanged.
  https://github.com/matemolnar8/comprehende/pull/77
- commit 0e0d850 Show how grouping and claims shifted between two review JSON files. Live git stays the how.
  https://github.com/matemolnar8/comprehende/commit/0e0d85039c547ae5207b51e5ada8ed67e877e607
- commit 25c1447 When two reviews name the same source under different ids, compare grouping and prose against the match, and keep the original from-text.
  https://github.com/matemolnar8/comprehende/commit/25c1447e9c9388f263b685a884edb25c8b7bde9b
- transcript Cursor session · Sep 13 Implement an initial usable version of #72. Prefer not to edit SKILL.md. If SKILL.md must change, follow writing-for-agents.

The title:

Compare two review documents

The why:

[#72](source:s1) wants a comparison of two review JSON files for the same change, so a human can see how grouping and claims shifted.

The what (medium):

`compare --from` and `--to` diffs two review documents. Matching uses group id, unique title, then hunk overlap. The CLI prints a text report, JSON, or a local UI. Live git stays the how.

Look for:
- [#72](source:s1) forbids a second code-diff view. The compare UI and text report print hunk pointers, not patch text.
- [#72](source:s1) keeps forge patch-set IDs out of the product model. Groups match by id, unique title, then hunk overlap.
- [#72](source:s1) forbids auto-accept of the later review. `compare` reports. It does not write a review file.
- [#72](source:s1) lists speculative drill-down UX as out of scope. This change does not add that UX.
- [The session](source:s5) asked to leave `skills-next/comprehende/SKILL.md` unchanged unless required. No hunk touches that file.

## Review concerns

### 01 Review comparison (`engine`)

`compareReviews` matches groups by id, unique title, then hunk overlap, and diffs the interpretation fields.

[groups/engine.md](groups/engine.md)

### 02 Text report (`report`)

`formatCompare` prints Interpretation, From, To, Document, and Groups from the payload.

Depends on:
- 01 Review comparison (`engine`)

[groups/report.md](groups/report.md)

### 03 compare command (`cli`)

The CLI loads two review files, skips the work-tree check, and prints text, JSON, or opens the UI.

Depends on:
- 01 Review comparison (`engine`)
- 02 Text report (`report`)

[groups/cli.md](groups/cli.md)

### 04 Compare HTTP server (`server`)

`startCompareServer` serves `/api/compare.json` and returns 404 for other `/api/*` routes.

Depends on:
- 01 Review comparison (`engine`)

[groups/server.md](groups/server.md)

### 05 Compare UI (`ui`)

`Root` fetches `compare.json`. On 200 it mounts `CompareApp`, which shows added, removed, and changed groups as interpretation plus hunk pointers.

Depends on:
- 01 Review comparison (`engine`)
- 04 Compare HTTP server (`server`)

[groups/ui.md](groups/ui.md)

### 06 README command (`readme`)

The README documents `compare --from --to` with `--json` and `--open`.

[groups/readme.md](groups/readme.md)