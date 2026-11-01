Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify de6c86b23284d2dc40e2633828c3854e1e8e6b1a` and `git rev-parse --verify 1308bb9768274e14fa889edd8d238870c3b9f39d` in this repository.
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

base (merge-base)  de6c86b23284d2dc40e2633828c3854e1e8e6b1a

head               1308bb9768274e14fa889edd8d238870c3b9f39d

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames de6c86b23284d2dc40e2633828c3854e1e8e6b1a 1308bb9768274e14fa889edd8d238870c3b9f39d

Commits:
- 1308bb9 refresh: a changed or reformat match keeps its path, so read only its new side
- 92d1e69 File notes: wrap a long note under the rename badge; say a gone file drops its note
- 2120450 File notes: reject lockfile paths, grade file notes as claims
- 212774a File notes: one line per file on what changed in it

Sources:
- pr #173 Adds a one-line note per file of a group, kept to one muted line in the file header.
  https://github.com/matemolnar8/comprehende/pull/173

The title:

One-line file notes on what changed in each file of a group

The why:

[PR #173](source:pr) says a reader of a multi-file group still has to guess what changed in each file, and asks for one quiet line per file.

The what (medium):

Groups gain optional `fileNotes`, one line per file keyed by its head path. `validate` rejects a note on a path the group does not cover, `refresh` drops a note when its file changes, the file header shows it, and the skill says when to write one.

## Review concerns

### 01 Schema and validate (`contract`)

`fileNotes` in `review.ts` is a map from path to line, and `fileNoteErrors` in `anchors.ts` checks each key against the live hunks of its group.

[groups/contract.md](groups/contract.md)

### 02 Refresh drops a note when its file changes (`refresh`)

`refreshDocument` keeps a file note only when no hunk of its file is changed, reformatted, new, or gone, and `formatRefresh` counts the ones it drops.

Attention (tradeoff):
Any new, edited, or whitespace-only hunk in the file drops the note, even a hunk another group owns. A note that still holds is lost and must be written again. Decide whether that cost beats keeping a stale note.

Depends on:
- 01 Schema and validate (`contract`)

[groups/refresh.md](groups/refresh.md)

### 03 File header line (`ui`)

`Group` passes the note for each file to `HunkView`, which shows it in the header row the rename badge uses.

Depends on:
- 01 Schema and validate (`contract`)

[groups/ui.md](groups/ui.md)

### 04 Skill rule and glossary (`skill`)

The new File notes section in `SKILL.md` asks for a note on each file of a multi-file group unless the group `summary` covers it, and the glossary defines File note.

Attention (product):
The rule asks for a note on every file of a group with two or more files. In the `comprehende-57` smoke run that was 11 notes over 3 groups. Decide whether that density fits the noise budget, or whether notes should be only for files the summary leaves unclear.

Depends on:
- 01 Schema and validate (`contract`)

[groups/skill.md](groups/skill.md)

### 05 Eval rubric and grader (`eval`)

The grader packet prints each file note under its file, the grader checks file notes as claims, and `comprehende-57` gains rubric lines for the rule.

Depends on:
- 04 Skill rule and glossary (`skill`)

[groups/eval.md](groups/eval.md)

### 06 Generated copies (`generated`)

The JSON Schema and the skill copies are generated output; skip them once `pnpm check:skill` passes.

[groups/generated.md](groups/generated.md)