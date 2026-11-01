Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify f9d12b75708f86c165bb8249aa024f7914a785ef` and `git rev-parse --verify 5d59f087125233c028b0b844984838da3e3df2bf` in this repository.
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

base (merge-base)  f9d12b75708f86c165bb8249aa024f7914a785ef

head               5d59f087125233c028b0b844984838da3e3df2bf

Named refs at pin: origin/main ... t3/agent-deep-links

Read the diff:

git diff --find-renames f9d12b75708f86c165bb8249aa024f7914a785ef 5d59f087125233c028b0b844984838da3e3df2bf

Commits:
- 5d59f087 Claude Code opens in the work tree under serve
- 187fe9c9 Merge remote-tracking branch 'origin/main' into t3/agent-deep-links
- 02739aeb One Claude Code option: open the desktop app
- f9afaf69 Dropdown menu is a dev dependency: the UI is bundled
- 199ceec0 Ask AI buttons: pick the agent app and open a draft prompt by deep link

Sources:
- pr PR #172 A picker on every Ask AI button opens a draft prompt in the picked app by deep link.
  https://github.com/matemolnar8/comprehende/pull/172
- transcript T3 Code session · Nov 1 Máté asks for a target picker on all AI buttons, then for one Claude Code option that opens the desktop app, and for the work tree folder in local reviews only.

The title:

Ask AI buttons open the prompt in Claude Code, Codex, Cursor or T3 Code

The why:

The user wants the Ask AI buttons to [put the prompt directly into an agent chat box without sending it](source:s2).

The what (medium):

Each Ask AI button gets a menu that picks Copy prompt, Claude Code, Codex, Cursor or T3 Code, and opens a deep link for the picked app. `serve` now sends the work tree path as `repo.root`; an export sets it to null.

Look for:
- Claude Code's `folder` and Codex's `path` are not documented: [PR #172](source:s1) says they come from the apps' own code.

## Review concerns

### 01 Work tree path in the review payload (`repo-root`)

`readRepoIdentity` reads the work tree top, `reviewPayload` sends it as `repo.root`, and `exportStaticSite` replaces it with null before it writes any file.

Attention (contract):
`api/review.json` gains `repo.root`: the work tree top under `serve`, null in an export. The exported payload differs from the live one in that field only, and `export.test.ts` checks the rest still match.

[groups/repo-root.md](groups/repo-root.md)

### 02 Agent targets and the shared choice (`targets`)

`AGENT_TARGETS` maps each app to a function that builds its link from the prompt and `repo`, and `AgentTargetProvider` in `App.tsx` shares the stored choice with every button; most `App.tsx` lines only move one indent level.

Attention (product):
Under `serve`, Claude Code gets the work tree as `folder` and Codex as `path`; neither parameter is documented. Claude Desktop's own Finder action uses `claude://code/new?folder=`. An export has no `repo.root`, so both open without a folder.

Depends on:
- 01 Work tree path in the review payload (`repo-root`)

[groups/targets.md](groups/targets.md)

### 03 Split Ask button with the picker (`ask-button`)

`AskAgent` replaces `CopyPrompt` at the overview, group and question call sites, and adds a ▾ menu built on the new Radix `dropdown-menu`; a link target renders the button as an `<a href>`.

Depends on:
- 02 Agent targets and the shared choice (`targets`)

[groups/ask-button.md](groups/ask-button.md)