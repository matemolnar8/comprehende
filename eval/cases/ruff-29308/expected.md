# ruff-29308: [ty] Fix notebook cell lookups after cells with cell magics

PR #29308 in astral-sh/ruff, the top layer of a stack: `main` ← #29306 ← #29307 ← #29308. Its base branch `charlie/notebook-position-clamp` is the head branch of #29307, and `sources/pr-29307.json` holds that lower layer. Two bot comments report no ecosystem change and a benchmark gain. No human review comments. A small language-server fix in Rust with a unit test and an e2e test.

## Story

- Title: the PR title, or a short name for cell lookups after cell-magic cells.
- Why: present, from the PR body. Hover on `x` in a cell after a `%%bash` cell showed the type of `z` from the next cell.
- Size: small or medium. Eight files, two of them snapshots, 155 added lines.
- Parts: one story, so no parts or one part.
- Groups: 1 to 3.

## Groups

1. Cell index fix: `crates/ruff_notebook/src/notebook.rs`. `cell_range` maps the index among all cells to the index among Python cells, and the new unit test checks it.
2. Server callers: `crates/ty_server/src/document/range.rs`, `crates/ty_server/src/document.rs`, `crates/ty_server/src/server/api/requests/folding_range.rs`, `crates/ty_server/src/server/api/requests/semantic_tokens.rs`. One shared `cell_range` helper replaces the same lookup in two request handlers.
3. End-to-end test: `crates/ty_server/tests/e2e/notebook.rs` and its two snapshots. One test covers both groups above.

One group for all eight files, the e2e test inside group 1 or 2, or the `range.rs` helper in group 1 with the code it wraps, is also good.

## Must

- `Notebook::cell_range` now converts the cell's index among all notebook cells to its index among valid Python code cells with a binary search on `valid_code_cells`, so a cell after a `%%bash` cell gets its own offsets.
- The review names PR #29307, the lower layer of the stack whose head branch is this request's base, as a `pr` source.

## Good

- `cell_range` and `cell_content_range` now return `None` for a cell that is not in the Python source, such as a Markdown cell or a cell-magic cell.
- Folding range and semantic token requests for a cell with no range now return no result; at base a `None` range gave results for the whole notebook.
- `Notebook::cell_range` is public and its argument now means the index among all cells; outside tests, its only callers at head are `cell_content_range` and the server `cell_range` helper.
- Position requests such as hover on a cell-magic cell now resolve to nothing, because `cell_content_range` returns `None` for that cell; at base they resolved into the next Python cell.
- Hover reaches the fix through position conversion in `range.rs`, which at base calls `cell_content_range` (added by PR #29307), which calls `cell_range`; so this layer also corrects #29307's clamp for cells after a magic cell.
- The new unit test `cell_range_by_raw_cell_index` uses `valid.ipynb`, where the third cell is the second Python cell and the second cell is Markdown.
- `cell_range` includes the cell's separator newline and `cell_content_range` excludes it, as the unit test's end offsets 168 and 167 show.

## Must not

- Do not describe the clamp of a position to the end of its cell (`offset.min(cell_range.end())`) as a change of this request; PR #29307 adds it and it is not in this diff.
- Do not credit the CodSpeed benchmark gain to this diff; the comment compares head with another commit (`03ea17f` in its header, `c9e4751` in its footnote), not with this request's base `867edce`.
- Do not write a group attention that asks for more notebook tests, a cache for `valid_code_cells`, or a new name for `cell_range`; a missing test, a performance idea, and a nit are not attentions.
- Do not write a group question that asks why `cell_range` now maps the cell index to the index among Python cells; the PR body names the hover bug after a `%%bash` cell that this fixes.

## Notes

The harness hands the producer the base and head SHAs, so this case cannot check that the skill picks the stacked base on its own. The base is the forge's `base.sha` for #29307's head, not the `merge_commit_sha^1` that `pnpm eval:add` writes. The stack was squash-merged onto `main` one layer at a time, so `merge_commit_sha^1` is the squash of #29307 on `main`, and its three-dot diff with this head holds ten files, with files from #29306 and #29307 too. What the case checks is the other half of the rule: the lower layer is a `pr` source, and the review does not describe its code as this change.

The `None` results and the empty folding and token results are `Good`: the PR body states them and the diff shows them plainly. The public `cell_range` contract, the hover path, and the magic-cell hover result are `Good` because the reader has to read code outside the diff to see them.

The `case.json` `together` pairs keep the e2e test with its two snapshots and the two request handlers in one group.

Homes: the `cell_range` index fix and the `None` results live in the group summaries. The changed meaning of the public `cell_range` argument fits a `contract` attention on the group that holds `notebook.rs`. The lower layer #29307 is a `pr` source, and a review that says what #29307 owns does so in prose, not as an attention.
