Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae` and `git rev-parse --verify 831ca5da9276ead82ada198ba2b928e62c3710f2` in this repository.
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

base (merge-base)  3d282dc3d8e5a36190f501ab5d73fa0b9f138cae

head               831ca5da9276ead82ada198ba2b928e62c3710f2

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae 831ca5da9276ead82ada198ba2b928e62c3710f2

Commits:
- 831ca5d cobra-2356: a note that repeats the code comment is a Must not
- bae4cb6 Size show's number column from the last line, not one past it
- c82b14b Fix excerpt headers on an empty side, widen mid-block ranges, keep no-newline marks in show
- 6507719 Focus ranges and line notes inside hunks

Sources:
- ticket #163 Asks for per-group focus ranges and notes, loud validate checks, a collapsed hunk view, refresh rules per hunk status, and numbered show output.
  https://github.com/matemolnar8/comprehende/issues/163
- pr PR #170 Implements #163 on main beside group attention and questions, and lists its decisions for review.
  https://github.com/matemolnar8/comprehende/pull/170

The title:

Focus ranges and lettered line notes inside hunks

The why:

[PR #170](source:s2) says reviewers read long hunks top to bottom and lose the few lines that matter, and that context about a line has nowhere to live except group prose.

The what (large):

Groups gain `focus` ranges and up to three line `notes`. `validate` checks them against live hunks, `refresh` carries them, `show` prints line numbers to copy, and the group view opens a focused hunk on its range with lettered note pins.

Look for:
- [#163](source:s1) gives refresh rules for `same`, `changed`, and `gone` hunks. At head, `carryAnchors` also drops a range or note on a `reformat` hunk and counts it with the `changed` ones in the report. [PR #170](source:s2) gives the reason: whitespace edits can move lines inside the hunk.

## Review concerns

### 01 Focus and note fields (`schema`)

`review.ts` adds `focus` and `notes` to the group schema, and `anchor.ts` finds the live hunk that holds a range or a note.

Attention (contract):
The 25-line cap, `end >= start`, and the three-note cap are zod checks in `review.ts`. So `serve` and `export` also refuse a document that breaks them, not only `validate`. Decide whether a bad range should block `serve`.

[groups/schema.md](groups/schema.md)

### 02 validate and refresh (`anchors`)

`cmdValidate` adds `anchorErrors` from `anchors.ts`, and `refreshDocument` calls `carryAnchors` to shift or drop each anchor and count the drops for the report.

Attention (tradeoff):
`carryAnchors` keeps an anchor only on a `same` hunk. A whitespace-only push makes the hunk `reformat`, so its ranges and notes drop, and the agent writes them again. Decide whether that loss is worth the safety.

Depends on:
- 01 Focus and note fields (`schema`)

[groups/anchors.md](groups/anchors.md)

### 03 Numbered show (`show`)

`cmdShow` prints `numberedPatch` from `show.ts`, which numbers the raw hunk text and keeps git's no-newline marker.

[groups/show.md](groups/show.md)

### 04 Collapsed hunk and note pins (`ui`)

`focusPatch` in `focus.ts` cuts the file patch to the focused lines, `HunkView` renders it under a `FocusBar`, and `PierreDiff` adds `NotePin` rows as line annotations.

Attention (tradeoff):
While any hunk of a file is cut, `HunkView` turns hydration off and `PierreDiff` shows `@@` headers between hunks instead of expandable gaps. A gap count would call the hidden changed lines unmodified. Decide whether losing gap expansion until "Show whole hunk" is the right cost.

Questions:
- Why does `focusPatch` fall back to the whole patch when its `@@` lines do not match the file's hunks, instead of failing?

Depends on:
- 01 Focus and note fields (`schema`)

[groups/ui.md](groups/ui.md)

### 05 Eval grading (`eval`)

`packet.ts` lists each group's ranges and notes for the grader, `graders.ts` checks each caption and note at head, and three `expected.md` files gain rubric lines.

Depends on:
- 01 Focus and note fields (`schema`)

[groups/eval.md](groups/eval.md)

### 06 Skill and glossary (`skill`)

A Focus and notes section in `SKILL.md` names when to write each one, and `example.md` and the glossary show both beside attention and questions.

Depends on:
- 01 Focus and note fields (`schema`)

[groups/skill.md](groups/skill.md)

### 07 Synced copies and generated schema (`generated`)

The `.agents` skill files copy `skills-next`, and the three `review.schema.json` files come from `review.ts`, so the reader can skip them.

[groups/generated.md](groups/generated.md)