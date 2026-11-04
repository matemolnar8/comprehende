Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 587e7aebf3074a2288cf7bee6eacfddba4bb3073` and `git rev-parse --verify bb865b7baa24a3c16de3c9282e41c4d095c15628` in this repository.
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

base (merge-base)  587e7aebf3074a2288cf7bee6eacfddba4bb3073

head               bb865b7baa24a3c16de3c9282e41c4d095c15628

Named refs at pin: 587e7aeb ... bb865b7b

Read the diff:

git diff --find-renames 587e7aebf3074a2288cf7bee6eacfddba4bb3073 bb865b7baa24a3c16de3c9282e41c4d095c15628

Commits:
- bb865b7b UI: design polish from screenshot reviews

Sources:
- pr PR #181 Polishes every screen until three design reviewers each scored it at least 8.5/10; adds reproducible screenshots, a favicon logo, sidebar collapse, blame summaries, and "Things to check" copy.
  https://github.com/matemolnar8/comprehende/pull/181
- transcript Claude Code session · Nov 4 Máté asks for a screenshot-driven design hill-climb scored by a council, then for the favicon as the logo, an easy sidebar collapse button, an Ask agent control that looks like a button, a fixed agent prompt, and a smaller diff.

The title:

A cleaner, clearer review UI, polished until three design reviewers scored it 8.5+

The why:

The review UI should impress a professional designer with how clean and clear it is: easy to use and easy on the eyes [design hill-climb](source:s2).

The what (large):

The change restyles every screen of the review UI on a set of shared controls, adds a sidebar collapse button and a favicon logo, shows the commit summary in blame, and adds `pnpm ui:screenshots` to shoot 6 reference screenshots of a real review.

Things to check:
- The [session](source:s2) asks to "fix the agent prompt as well". The only prompt change is the label: `lookForBlock` in `src/api/agent-md.ts` prints `Things to check:` in place of `Look for:`. The rest of the prompt text is the same as on base.
- The [session](source:s2) asks to handle the rest of the follow-ups from the last design review. Wrapped code lines still restart at column 0, with no hanging indent. The session gives the reason: Pierre's CSS cannot indent a wrapped line to match its leading spaces.
- Manual step: `CONTRIBUTING.md` says to run `pnpm exec playwright install chromium` once per machine before `pnpm ui:screenshots`. Without it, `chromium.launch` fails and the script exits with code 1.

## Review concerns

### 01 Shared controls and tokens (`controls`)

The new `Segmented`, `ViewedToggle`, and `DiffStat` components and the extra `Badge` and menu variants draw on the colour tokens in `styles.css`, which the later groups reuse.

[groups/controls.md](groups/controls.md)

### 02 Header, sidebar, and navigation (`shell`)

`Header` holds the favicon `Logo`, the `SidebarButton` that collapses the sidebar panel in `App`, the new `DisplayMenu`, and `GroupNav`, whose arrows follow `neighborSelection` in `selection.ts`.

Attention (product):
`neighborSelection` in `selection.ts` now walks `groupWalk`, every group of every part. It used to stay inside the current part (`partWalk`, removed). So `]` and the header arrow on a part's last group now open the next part's first group, and `{` and `}` still jump part to part.

Questions:
- Why does the header `SidebarButton` collapse the sidebar without saving it, while a drag-collapse is saved by `useDefaultLayout`?

Depends on:
- 01 Shared controls and tokens (`controls`)

[groups/shell.md](groups/shell.md)

### 03 Overview and group brief (`brief`)

`Overview` and `GroupBrief` lay out the why, the what, the attention, questions, and sources through the `Kicker` labels and rail, with the outlined `AskAgent` split button beside the title.

Depends on:
- 01 Shared controls and tokens (`controls`)

[groups/brief.md](groups/brief.md)

### 04 Files list and image cards (`files`)

`FileNav` lists a group's files with `repeatedNameFolders` from `file-nav.ts` highlighting the folder that differs, and `ImageDiff` sizes each image card with `image-stage.ts`.

Questions:
- Why does `FileRows` drop the middle cut of long names, so a long name now cuts at its end and can lose its extension?

Depends on:
- 01 Shared controls and tokens (`controls`)

[groups/files.md](groups/files.md)

### 05 Diff cards (`diff`)

`HunkView` frames each file's `PierreDiff`, whose CSS strings come from `gap-style.ts`, `syntax-theme.ts`, and the moved-line rules, and whose gaps and focus bars come from `hunk-gaps.ts` and `focus.ts`.

Attention (tradeoff):
`resolveWrap` in `narrow.ts` now returns `true` when no toggle is set; before, only narrow screens wrapped. Long code lines wrap on desktop too, and so do markdown tables, which lose their column alignment. Pierre sets wrap per file, so no file type can opt out.

Depends on:
- 01 Shared controls and tokens (`controls`)

[groups/diff.md](groups/diff.md)

### 06 Blame shows the commit summary (`blame`)

`parseBlamePorcelain` in `blame.ts` reads each commit's `summary` line, `groupBlameRuns` carries it on each run, and the `BlameStamp` in `PierreDiff.tsx` shows it in the `Inspector` Blame mode.

Attention (product):
`BlameStamp` shows the summary and the In this review badge only when `meta.inRange`. A run from a commit before base shows its SHA, author, and date, with no summary. The reviewer decides whether older summaries would help or only add noise.

Depends on:
- 05 Diff cards (`diff`)

[groups/blame.md](groups/blame.md)

### 07 "Things to check" in the agent prompt (`things-to-check`)

`lookForBlock` in `agent-md.ts` and the glossary entry now use the UI label "Things to check"; the schema field stays `lookFor`.

[groups/things-to-check.md](groups/things-to-check.md)

### 08 Reproducible UI screenshots (`screenshots`)

`pnpm ui:screenshots` runs `scripts/ui-screenshots.ts`, which builds the UI, rebuilds the `cigster-99` eval repo from its bundle, serves it with the saved review, and shoots 6 scenes with Playwright into the gitignored `fixtures/screenshots/`.

Attention (risk):
`runUiScreenshots` runs `rm` with `recursive` and `force` on `fixtures/screenshot-repos` and on the `--out` folder before every run. `--out` is not checked, so a wrong path deletes that folder and everything in it. The default is the gitignored `fixtures/screenshots`.

[groups/screenshots.md](groups/screenshots.md)