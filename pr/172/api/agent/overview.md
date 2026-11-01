Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify de6c86b23284d2dc40e2633828c3854e1e8e6b1a` and `git rev-parse --verify 02739aebc0a4f3928a5867376d0363b45591795d` in this repository.
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

head               02739aebc0a4f3928a5867376d0363b45591795d

Named refs at pin: origin/main ... t3/agent-deep-links

Read the diff:

git diff --find-renames de6c86b23284d2dc40e2633828c3854e1e8e6b1a 02739aebc0a4f3928a5867376d0363b45591795d

Commits:
- 02739ae One Claude Code option: open the desktop app
- f9afaf6 Dropdown menu is a dev dependency: the UI is bundled
- 199ceec Ask AI buttons: pick the agent app and open a draft prompt by deep link

Sources:
- pr PR #172 A picker on every Ask AI button opens a draft prompt in the picked app by deep link.
  https://github.com/matemolnar8/comprehende/pull/172
- transcript T3 Code session · Nov 1 Máté asks for a target picker on all AI buttons, wants to test hosted review paths, then asks for one Claude Code option that opens the desktop app.

The title:

Ask AI buttons open the prompt in Claude Code, Codex, Cursor or T3 Code

The why:

The user wants the Ask AI buttons to [put the prompt directly into an agent chat box without sending it](source:s2).

The what (medium):

Each Ask AI button gets a menu that picks Copy prompt, Claude Code, Codex, Cursor or T3 Code, and opens a deep link for the picked app. `serve` now sends the work tree path as `repo.root`; an export sets it to null.

Look for:
- Claude Desktop was not opened in testing: [PR #172](source:s1) says the `claude://code/new?q=` link comes from the docs only.

## Review concerns

### 01 Work tree path in the review payload (`repo-root`)

`readRepoIdentity` reads the work tree top, `reviewPayload` sends it as `repo.root`, and `exportStaticSite` replaces it with null before it writes any file.

Attention (contract):
`api/review.json` gains `repo.root`: the work tree top under `serve`, null in an export. The exported payload differs from the live one in that field only, and `export.test.ts` checks the rest still match.

[groups/repo-root.md](groups/repo-root.md)

### 02 Agent targets and the shared choice (`targets`)

`AGENT_TARGETS` maps each app to a function that builds its link from the prompt and `repo`, and `AgentTargetProvider` in `App.tsx` shares the stored choice with every button; most `App.tsx` lines only move one indent level.

Attention (product):
Claude Code opens the desktop app with `claude://code/new?q=`, which has no local folder parameter. Under `serve` too, the reader picks the folder in Desktop; only Codex gets the work tree as `path`.

Depends on:
- 01 Work tree path in the review payload (`repo-root`)

[groups/targets.md](groups/targets.md)

### 03 Split Ask button with the picker (`ask-button`)

`AskAgent` replaces `CopyPrompt` at the overview, group and question call sites, and adds a ▾ menu built on the new Radix `dropdown-menu`; a link target renders the button as an `<a href>`.

Depends on:
- 02 Agent targets and the shared choice (`targets`)

[groups/ask-button.md](groups/ask-button.md)