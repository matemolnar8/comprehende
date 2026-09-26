Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3` and `git rev-parse --verify 63907ffdaebec71cdb40c43afd7e56c24fec99f9` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3 63907ffdaebec71cdb40c43afd7e56c24fec99f9 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  732a01b08eaa2f79562ea4e2ef76e38c9d92eee3

head               63907ffdaebec71cdb40c43afd7e56c24fec99f9

Named refs at pin: main ... eval-musecode-agent

Read the diff:

git diff --find-renames 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3 63907ffdaebec71cdb40c43afd7e56c24fec99f9

Review concern 02 of 02: Agent selection wiring (`agent-wiring`)

The why:

The user asked to run eval producers and graders optionally in Muse Code [user request](source:s1).

The what:

Threads per-role agent choice plus the Muse model and key from CLI flags through the producer, both graders, the run summary, and the report.

Look for:
- The `--sandbox` flag reaches only Cursor agents. A Muse producer always runs with `--yolo`, so sandbox and approval stay off for that role.

Depends on:
- 01 Muse Code runner (`musecode-runner`)

Hunk refs for this concern:
- scripts/eval/args.test.ts
- scripts/eval/args.ts
- scripts/eval/constants.ts
- scripts/eval/graders.test.ts
- scripts/eval/graders.ts
- scripts/eval/producer.ts
- scripts/eval/report.test.ts
- scripts/eval/report.ts
- scripts/eval/result.ts
- scripts/eval/run.ts