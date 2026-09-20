Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 69d6415a9f77e02741ff146bdee744ff7648204e` and `git rev-parse --verify d05d71698063919c5928f161ed03e5c749f26594` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 69d6415a9f77e02741ff146bdee744ff7648204e d05d71698063919c5928f161ed03e5c749f26594 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  69d6415a9f77e02741ff146bdee744ff7648204e

head               d05d71698063919c5928f161ed03e5c749f26594

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 69d6415a9f77e02741ff146bdee744ff7648204e d05d71698063919c5928f161ed03e5c749f26594

Review concern 03 of 03: PR smoke vs event-driven full suite (`trigger`)

The why:

[#87](source:s1) updates the AGENTS PR path and runs the full graded suite after relevant main landings, not on a cron.

The what:

AGENTS.md requires `pnpm eval -- --tag smoke --no-graders`. `eval.yml` runs `pnpm eval` on path-filtered pushes to main and on `workflow_dispatch`.

Look for:
- Subtle. An empty `CURSOR_API_KEY` secret makes `eval.yml` exit 0, so a missed secret does not fail main.

Depends on:
- 02 Skip graders on the smoke path (`no-graders`)

Hunk refs for this concern:
- .github/workflows/eval.yml @@ -0,0 +1,56 @@
- AGENTS.md @@ -92,7 +92,9 @@