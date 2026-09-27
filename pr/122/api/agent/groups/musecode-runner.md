Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3` and `git rev-parse --verify 6847b9e7fc8298367d6cbaa5d0892f88b6d67f44` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3 6847b9e7fc8298367d6cbaa5d0892f88b6d67f44 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
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

Review concern 01 of 03: Muse Code runner (`musecode-runner`)

The why:

This group is the foundation the agent wiring group calls. It enables that group.

The what:

Spawns headless `muse exec --json` with the prompt in a temp file and the API key on stdin, then parses the JSONL terminal event, tool intents, and model steps into `AgentRunResult`.

Look for:
- Muse runs report 0 tokens because the JSONL stream carries no usage counts, so token totals undercount mixed-agent runs.
- Muse tool calls carry names only with no argument detail, so the cli-hunt metric in the run totals stays 0 for Muse producers.

Hunk refs for this concern:
- scripts/eval/musecode.test.ts
- scripts/eval/musecode.ts