Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 61f79cce8191e348bcd1d72ade335b4c47c18ad9` and `git rev-parse --verify 603bbf138873e1fab673ef73d0a8238cc225190a` in this repository.
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

base (merge-base)  61f79cce8191e348bcd1d72ade335b4c47c18ad9

head               603bbf138873e1fab673ef73d0a8238cc225190a

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 61f79cce8191e348bcd1d72ade335b4c47c18ad9 603bbf138873e1fab673ef73d0a8238cc225190a

Commits:
- 603bbf1 Allow in-range GitHub commit URLs in eval source checks
- 261aac7 Record eval case duration before writing result.json
- 11108ce Add a Cursor SDK eval harness that grades review quality

Sources:
- ticket #52 Asks for a Cursor SDK script so LLMs grade review quality, with an isolated producer and a trigger after skill changes.
  https://github.com/matemolnar8/comprehende/issues/52
- pr PR #68 Implements the repo-local eval harness from the #52 design.
  https://github.com/matemolnar8/comprehende/pull/68
- ticket design on #52 Harness in scripts/eval and eval/cases. Constraints in expect, not a gold review. Exit 1 only on deterministic failures. Two read-only graders emit findings.
  https://github.com/matemolnar8/comprehende/issues/52#issuecomment-5648608602
- commit 11108ce Adds the eval CLI, case schema, producer, checks, graders, and the first seven cases.
  https://github.com/matemolnar8/comprehende/commit/11108ceae77651c0215de73990b7a73c9211ee77
- commit 603bbf1 Treats github.com commit URLs as valid when the SHA is in the reviewed range.
  https://github.com/matemolnar8/comprehende/commit/603bbf138873e1fab673ef73d0a8238cc225190a
- transcript Cursor session · Sep 13 Asked to implement the posted design and run it, including the exit-code rule.

The title:

Report grader eval harness

The why:

[#52](source:s1) asks for a Cursor SDK script that grades review quality. The [design on #52](source:s3) puts that in a repo-local harness whose exit code follows deterministic checks only.

The what (large):

`pnpm eval` pins each case's worktree, runs an isolated producer on skills-next, then grades the review with expect checks and two read-only graders.

Look for:
- The [design on #52](source:s3) wants `pnpm eval -- --tag smoke` after skills-next, schema, or review changes, and no CI. `AGENTS.md` adds that line. No workflow file changes.
- The [design on #52](source:s3) says LLM findings must not fail the process. `caseFailed` ignores grader findings.
- [#52](source:s1) and the [design](source:s3) name a trigger agents can run. `pnpm eval` needs `CURSOR_API_KEY`. That secret is not in this diff.
- The [design](source:s3) leaves cigster and comprehende #54 out of the first slice. Those folders are not under `eval/cases`.

## Review concerns

### 01 Case schema and flags (`schema`)

Zod parses `eval/cases/*/case.json`. `parseEvalArgv` selects cases by id or tag and sets the two models.

[groups/schema.md](groups/schema.md)

### 02 Pin a PR into a worktree (`clone`)

`add-case` fetches PR JSON with `gh` and records base and head SHAs. `clone.ts` fills a bare cache and adds a detached worktree at head.

Depends on:
- 01 Case schema and flags (`schema`)

[groups/clone.md](groups/clone.md)

### 03 Isolated producer (`producer`)

`copySkillForEval` rewrites the CLI pin. `runLocalAgent` uses empty `settingSources` and disallows task, search, and MCP.

Depends on:
- 02 Pin a PR into a worktree (`clone`)

[groups/producer.md](groups/producer.md)

### 04 Deterministic checks (`checks`)

Checks flag a dirty worktree, invented source URLs, why/parts/size, together/apart, and long or dashed prose. `gradingPacket` is the live hunks those graders read.

Depends on:
- 01 Case schema and flags (`schema`)
- 03 Isolated producer (`producer`)

[groups/checks.md](groups/checks.md)

### 05 Read-only graders (`graders`)

Two new agents get only read tools. JSON is Zod-parsed. A second send retries a parse miss.

Depends on:
- 04 Deterministic checks (`checks`)

[groups/graders.md](groups/graders.md)

### 06 `pnpm eval` orchestrator (`run`)

`runEval` walks cases, prints one line each, exports the produced review, and exits 1 only when a deterministic check fails. Package scripts, gitignore, and AGENTS.md wire that command.

Depends on:
- 03 Isolated producer (`producer`)
- 04 Deterministic checks (`checks`)
- 05 Read-only graders (`graders`)

[groups/run.md](groups/run.md)

### 07 Eval unit tests (`tests`)

Case schema, argv, GitHub URLs, checks, packet, graders JSON, skill copy, and `replaceCliPin` have node:test coverage.

Depends on:
- 06 `pnpm eval` orchestrator (`run`)

[groups/tests.md](groups/tests.md)

### 08 Frozen first-slice cases (`cases`)

Each case folder holds `case.json` plus frozen PR, issue, and comment JSON. `#50` and `#57` are tagged smoke.

Depends on:
- 01 Case schema and flags (`schema`)

[groups/cases.md](groups/cases.md)