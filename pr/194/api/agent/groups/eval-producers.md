Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 742c7c46b48dec27a765681256e41cd7cab1017f` and `git rev-parse --verify bd4dffc00d5e2489eec48e49eefda626f8f7fe7d` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 742c7c46b48dec27a765681256e41cd7cab1017f bd4dffc00d5e2489eec48e49eefda626f8f7fe7d -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  742c7c46b48dec27a765681256e41cd7cab1017f

head               bd4dffc00d5e2489eec48e49eefda626f8f7fe7d

Named refs at pin: 742c7c46b48dec27a765681256e41cd7cab1017f ... bd4dffc0

Read the diff:

git diff --find-renames 742c7c46b48dec27a765681256e41cd7cab1017f bd4dffc00d5e2489eec48e49eefda626f8f7fe7d

Review concern 04 of 04: Claude Code and Cursor producers (`eval-producers`)

Part: Eval producers

The what:

`parseProducer` sends a `claude-*` model to `runClaudeCodeAgent` and a `cursor/<model>` model to `runCursorAgent`, both on the shared `runHeadless`; other models stay on Muse. Case lines and run totals print producer cost and reasoning tokens when the runner reports them.

Attention (risk):
`runClaudeCodeAgent` passes `--dangerously-skip-permissions`, and `runCursorAgent` passes `--force --trust --sandbox disabled`. The producer runs any shell command on the developer's machine with their CLI login, and no flag in these arguments limits it to the clone. Decide whether an eval run may run unchecked like this.

Hunk refs for this concern:
- scripts/eval/constants.ts
- scripts/eval/producer.ts
- scripts/eval/claudecode.ts
- scripts/eval/claudecode.test.ts
- scripts/eval/cursor.ts
- scripts/eval/cursor.test.ts
- scripts/eval/headless.ts
- scripts/eval/headless.test.ts
- scripts/eval/args.ts
- scripts/eval/args.test.ts
- scripts/eval/run.ts
- scripts/eval/musecode.ts
- scripts/eval/result.ts
- scripts/eval/report.ts
- docs/eval.md