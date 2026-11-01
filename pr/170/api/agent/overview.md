Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify edf8493d0359215e44fbe8b801c108ca61c609a2` and `git rev-parse --verify e9f4feaea4f6a3725324ae13159d13fcb53ef6c9` in this repository.
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

base (merge-base)  edf8493d0359215e44fbe8b801c108ca61c609a2

head               e9f4feaea4f6a3725324ae13159d13fcb53ef6c9

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames edf8493d0359215e44fbe8b801c108ca61c609a2 e9f4feaea4f6a3725324ae13159d13fcb53ef6c9

Commits:
- e9f4fea Size show's number column from the last line, not one past it
- 3c4f1ab Fix excerpt headers on an empty side, widen mid-block ranges, keep no-newline marks in show
- 09e2e61 Focus ranges and line notes inside hunks

Sources:
- ticket #163 Per-group focus ranges and notes, loud validate checks, a collapsed hunk view, refresh rules per hunk status, and numbered show output.
  https://github.com/matemolnar8/comprehende/issues/163
- pr PR #170 Implements #163 on main, with decisions for review.
  https://github.com/matemolnar8/comprehende/pull/170

The title:

Focus ranges and lettered line notes inside hunks

The why:

[#163](source:s1) brings excerpts and lettered, line-anchored notes to Comprehende, anchored so live git still wins.

The what (large):

Groups gain `focus` ranges and up to three `notes`. `validate` checks them against live hunks, `refresh` carries them, `show` prints line numbers, and the group view opens a focused hunk on its range with lettered note pins.

Look for:
- [#163](source:s1) says only `changed` names the group in the refresh report. Head also drops `reformat` anchors and anchors that land on context a `same` hunk no longer shows, and counts both with the `changed` ones.

## Review concerns

### 01 Focus and note fields (`schema`)

`review.ts` adds `focus` and `notes` to the group schema, and `anchor.ts` holds the helpers that find the hunk holding an anchor.

Attention (contract):
The 25-line cap, `end >= start`, and the three-note cap are zod checks in `review.ts`, so `serve` and `export` also refuse a document that breaks them. Only placement against live hunks waits for `validate`. Decide whether a bad range should block `serve`.

[groups/schema.md](groups/schema.md)

### 02 validate and refresh (`anchors`)

`anchorErrors` in `anchors.ts` runs from `cmdValidate`, and `carryAnchors` runs inside `refreshDocument` to shift or drop each anchor.

Attention (tradeoff):
A `reformat` hunk drops its ranges and notes like a `changed` one, because whitespace edits can move lines inside the hunk. A whitespace-only push loses them, and the agent writes them again.

Depends on:
- 01 Focus and note fields (`schema`)

[groups/anchors.md](groups/anchors.md)

### 03 Numbered show (`show`)

`numberedPatch` in `show.ts` numbers the raw hunk text, and `cmdShow` prints it for a file or a hunk.

[groups/show.md](groups/show.md)

### 04 Collapsed hunk and note pins (`ui`)

`focusPatch` in `focus.ts` cuts the file patch to the focused lines that `HunkView` renders under a `FocusBar`, and `PierreDiff` adds `NotePin` rows as line annotations.

Attention (tradeoff):
While any hunk of a file is cut, `HunkView` turns off hydration and `PierreDiff` shows `@@` headers between hunks instead of expandable gaps. A gap count would call hidden changed lines unmodified. "Show whole hunk" brings both back.

Depends on:
- 01 Focus and note fields (`schema`)

[groups/ui.md](groups/ui.md)

### 05 Eval grading (`eval`)

The grading packet lists each group's ranges and notes, the grader checks each caption and note at head, and three `expected.md` files gain rubric lines.

Depends on:
- 01 Focus and note fields (`schema`)

[groups/eval.md](groups/eval.md)

### 06 Skill and glossary (`skill`)

A new Focus and notes section in `SKILL.md` names when to write each one, and `example.md` and the glossary show both.

Depends on:
- 01 Focus and note fields (`schema`)

[groups/skill.md](groups/skill.md)

### 07 Synced copies and generated schema (`generated`)

The `.agents` skill files copy `skills-next`, and the three `review.schema.json` files are generated from `review.ts`; the reader can skip them.

[groups/generated.md](groups/generated.md)