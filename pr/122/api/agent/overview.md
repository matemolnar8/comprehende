Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3` and `git rev-parse --verify 6847b9e7fc8298367d6cbaa5d0892f88b6d67f44` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  732a01b08eaa2f79562ea4e2ef76e38c9d92eee3

head               6847b9e7fc8298367d6cbaa5d0892f88b6d67f44

Named refs at pin: main ... eval-musecode-agent

Read the diff:

git diff --find-renames 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3 6847b9e7fc8298367d6cbaa5d0892f88b6d67f44

Commits:
- 6847b9e Eval: fall back to Muse Code when Cursor fails
- 63907ff Eval: run producers and graders in Muse Code

Sources:
- transcript Muse Code session · Sep 26 The user asked to run eval producers and graders optionally in Muse Code, then for CI to fall back to Muse when Cursor fails with an early usage-limit check, and to open this PR.

The title:

Eval agents in Muse Code with Cursor fallback

The why:

The user wants eval producers and graders able to run in Muse Code, and CI to switch to Muse when Cursor errors, especially on usage limits.

The what (small):

The eval harness gains an optional Muse Code agent for the producer and grader roles, plus a fallback that probes Cursor first and moves cursor roles to Muse on any error. CI installs the Muse CLI and arms that fallback.

## Review concerns

### 01 Muse Code runner (`musecode-runner`)

Spawns headless `muse exec --json` with the prompt in a temp file and the API key on stdin, then parses the JSONL terminal event, tool intents, and model steps into `AgentRunResult`.

[groups/musecode-runner.md](groups/musecode-runner.md)

### 02 Agent selection wiring (`agent-wiring`)

Threads per-role agent choice plus the Muse model and key from CLI flags through the producer, both graders, the run summary, and the report.

Depends on:
- 01 Muse Code runner (`musecode-runner`)

[groups/agent-wiring.md](groups/agent-wiring.md)

### 03 Cursor fallback (`cursor-fallback`)

Probes Cursor with one tiny call before the run and moves cursor roles to Muse Code on any error, while CI installs the CLI and arms the flag.

Depends on:
- 02 Agent selection wiring (`agent-wiring`)

[groups/cursor-fallback.md](groups/cursor-fallback.md)