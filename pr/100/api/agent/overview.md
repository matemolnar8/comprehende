Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a05aef85c489e9ccd5c42f7b3397219b35b95719` and `git rev-parse --verify d5c726fc18d330571360e3494af7bdd78ea6e0f3` in this repository.
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

base (merge-base)  a05aef85c489e9ccd5c42f7b3397219b35b95719

head               d5c726fc18d330571360e3494af7bdd78ea6e0f3

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a05aef85c489e9ccd5c42f7b3397219b35b95719 d5c726fc18d330571360e3494af7bdd78ea6e0f3

Commits:
- d5c726f Stop counting eval temp paths as CLI hunts.
- d9b391d Give graders tools back and keep the packet inline.
- 0ff61b3 Keep the prose grader's ask list and tighten CLI-hunt matching.
- b762397 Stop the eval CLI hunt and run graders with no tools.

Sources:
- ticket #97 CI cost, not the user path: state the injected CLI as a fact, and put the grading packet inline so graders waste fewer steps finding it.
  https://github.com/matemolnar8/comprehende/issues/97
- pr PR #100 Producer CLI-hunt fix, inline grading packet, graders keep work-tree tools, tool-call telemetry. No tools:[] and no step cap.
  https://github.com/matemolnar8/comprehende/pull/100

The title:

Eval harness: stop the CLI hunt, run graders without tools

The why:

[#97](source:s1) cuts CI eval cost: the producer prompt was sending the agent to verify the CLI path, and graders spent most of their tokens finding the packet and walking the tree.

The what (small):

The producer prompt names the injected `node <abs>/dist/cli/main.js` command as the built CLI. Graders get the packet inline, keep `read`/`grep`/`glob`/`ls`, and the prompt tells them to start from the packet and read only the files a check needs. Agent runs record tool calls so the eval line can print CLI-hunt and grader-tool counts.

Look for:
- [#97](source:s1) offered a tool-less grader as one option. This change keeps grader tools so they can check the code. There is no step cap.
- [#97](source:s1) asks for before/after CLI-hunt steps and grader tokens. `formatRunTotals` is the on-branch measurement; it is not a pass/fail.

## Review concerns

### 01 Record tool calls on each agent run (`traces`)

`runLocalAgent` records assistant steps and tool names plus a short detail, and `isCliHuntCall` classifies dist/CLI hunts.

[groups/traces.md](groups/traces.md)

### 02 Name the injected CLI as a built fact (`prompt`)

`producerPrompt` takes `cliPath` and tells the agent that `node <abs>/dist/cli/main.js` is the CLI, it is already built, and it must run that command as written.

[groups/prompt.md](groups/prompt.md)

### 03 Inline the packet; keep work-tree tools (`graders`)

`groupingPrompt` and `prosePrompt` embed the packet and tell the grader to start from it, then read only the files a check needs. `GRADER_TOOLS` stays `read`/`grep`/`glob`/`ls`.

[groups/graders.md](groups/graders.md)