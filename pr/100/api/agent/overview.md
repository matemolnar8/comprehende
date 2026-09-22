Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a05aef85c489e9ccd5c42f7b3397219b35b95719` and `git rev-parse --verify 0ff61b34155dc82c9265347a7d6464fc0faeaff6` in this repository.
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

head               0ff61b34155dc82c9265347a7d6464fc0faeaff6

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a05aef85c489e9ccd5c42f7b3397219b35b95719 0ff61b34155dc82c9265347a7d6464fc0faeaff6

Commits:
- 0ff61b3 Keep the prose grader's ask list and tighten CLI-hunt matching.
- b762397 Stop the eval CLI hunt and run graders with no tools.

Sources:
- ticket #97 CI cost, not the user path: state the injected CLI as a fact, and run graders on an inline packet with no tools.
  https://github.com/matemolnar8/comprehende/issues/97
- pr PR #100 Implements #97 in scripts/eval/: producer prompt, tool-less graders, and tool-call telemetry.
  https://github.com/matemolnar8/comprehende/pull/100

The title:

Eval harness: stop the CLI hunt, run graders without tools

The why:

[#97](source:s1) cuts CI eval cost: the producer prompt was sending the agent to verify the CLI path, and graders with `read`/`grep`/`glob`/`ls` were walking the work tree.

The what (small):

The producer prompt names the injected `node <abs>/dist/cli/main.js` command as the built CLI. Graders get the packet inline and `tools: []`. Agent runs record tool calls so the eval line can print CLI-hunt and grader-tool counts.

Look for:
- [#97](source:s1) says graders without tools must still grade correctly. If claim or grouping signals drop, the packet or prompt needs the missing facts inline.
- [#97](source:s1) asks for before/after CLI-hunt steps and grader tokens. `formatRunTotals` is the on-branch measurement; it is not a pass/fail.

## Review concerns

### 01 Record tool calls on each agent run (`traces`)

`runLocalAgent` records assistant steps and tool names plus a short detail, and `isCliHuntCall` classifies dist/CLI hunts.

[groups/traces.md](groups/traces.md)

### 02 Name the injected CLI as a built fact (`prompt`)

`producerPrompt` takes `cliPath` and tells the agent that `node <abs>/dist/cli/main.js` is the CLI, it is already built, and it must run that command as written.

[groups/prompt.md](groups/prompt.md)

### 03 Grade from an inline packet with no tools (`graders`)

`groupingPrompt` and `prosePrompt` embed the packet. `GRADER_TOOLS` is empty, so `runGrader` offers no built-in tools.

[groups/graders.md](groups/graders.md)