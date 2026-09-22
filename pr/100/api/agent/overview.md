Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify d796524f8e3f483ab92925f55f17835b7301a18f` and `git rev-parse --verify 6a0cfd928cce208a16889e3a50bc1f9e00e61872` in this repository.
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

base (merge-base)  d796524f8e3f483ab92925f55f17835b7301a18f

head               6a0cfd928cce208a16889e3a50bc1f9e00e61872

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames d796524f8e3f483ab92925f55f17835b7301a18f 6a0cfd928cce208a16889e3a50bc1f9e00e61872

Commits:
- 6a0cfd9 Allow large on the comprehende-67 size expect.
- f3d996d Drop leftover formatCaseLine statements after the #99 rebase.
- db8f69e Stop counting eval temp paths as CLI hunts.
- edf1947 Give graders tools back and keep the packet inline.
- 5d306bf Keep the prose grader's ask list and tighten CLI-hunt matching.
- 6097a32 Stop the eval CLI hunt and run graders with no tools.

Sources:
- ticket #97 CI cost, not the user path. State the injected CLI as a built fact. Put the grader packet inline. The ticket offered no tools or a small step budget.
  https://github.com/matemolnar8/comprehende/issues/97
- pr PR #100 Rebased onto #99. Skill files from main win. Producer CLI-as-fact stays. Graders keep tools, packet inline, no tools:[], no step cap.
  https://github.com/matemolnar8/comprehende/pull/100
- transcript Cursor session · Sep 22 Keep grader tools. Do not use tools:[]. Do not add a hard step cap. Packet stays inline. After #99, rebase onto main; skill files from #99; eval harness from this PR.

The title:

Eval harness: stop the CLI hunt, keep grader tools on targeted reads

The why:

[#97](source:s1) wants eval CI cheaper: the producer hunts the CLI, and graders spend most of the tokens walking the work tree to find a packet they already have.

The what (small):

The producer prompt names the injected `node <abs>/dist/cli/main.js` as a built fact. Graders get the packet inline and keep `read`/`grep`/`glob`/`ls` for targeted work-tree checks. The harness records each tool call so the run line can print cli-hunt and grader-tools. The comprehende-67 size expect also allows large.

Look for:
- [#97](source:s1) offered `tools: []` or a small step budget. This diff keeps `GRADER_TOOLS` and has no step cap. The packet is inline; the prompt asks for targeted reads only.
- The rebase keeps #99's "Skip the npm version check" without pinning it to step 1, and drops "the local build" for the injected CLI path.
- After #99 the producer labels comprehende-67 large. This diff widens that case expect rather than changing the skill.

## Review concerns

### 01 Per-call tool records (`tool-records`)

`AgentRunResult.toolCalls` is a `ToolCallRecord[]`. `isCliHuntCall` classifies producer hunts. `formatRunTotals` and the case line print those counts.

[groups/tool-records.md](groups/tool-records.md)

### 02 Producer CLI as a built fact (`cli-pin`)

`producerPrompt` takes `cliPath` and names `node <abs>/dist/cli/main.js` as the CLI. `run.ts` passes the resolved path. Tests forbid "local build" and "step 1".

Depends on:
- 01 Per-call tool records (`tool-records`)

[groups/cli-pin.md](groups/cli-pin.md)

### 03 Inline packet, keep grader tools (`grader-packet`)

`groupingPrompt` and `prosePrompt` embed the packet. `GRADER_PACKET_INTRO` tells the grader to start there and read only the files a check needs. `runGrader` still passes `GRADER_TOOLS`.

Depends on:
- 01 Per-call tool records (`tool-records`)

[groups/grader-packet.md](groups/grader-packet.md)

### 04 comprehende-67 size expect (`size-expect`)

`eval/cases/comprehende-67/case.json` adds `large` to the allowed size list.

[groups/size-expect.md](groups/size-expect.md)