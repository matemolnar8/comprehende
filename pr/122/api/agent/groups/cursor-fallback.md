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

Review concern 03 of 03: Cursor fallback (`cursor-fallback`)

The why:

The user asked CI to fall back to Muse when Cursor fails, with an early check that catches usage limits [user request](source:s1).

The what:

Probes Cursor with one tiny call before the run and moves cursor roles to Muse Code on any error, while CI installs the CLI and arms the flag.

Look for:
- Any probe error switches roles, not just usage limits, so one transient Cursor outage moves the whole run to Muse Code.
- CI downloads the ~340MB Muse binary on every eval run when the secret is set, because the install step has no cache.

Depends on:
- 02 Agent selection wiring (`agent-wiring`)

Hunk refs for this concern:
- .github/workflows/eval.yml
- scripts/eval/args.test.ts
- scripts/eval/args.ts
- scripts/eval/fallback.test.ts
- scripts/eval/fallback.ts
- scripts/eval/run.ts