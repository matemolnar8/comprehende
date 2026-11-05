Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 4ead77f938f8995fbae6e81f80833d04bac338ed` and `git rev-parse --verify 60446b8a8bd67320a7961211586485443a1c4239` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 4ead77f938f8995fbae6e81f80833d04bac338ed 60446b8a8bd67320a7961211586485443a1c4239 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  4ead77f938f8995fbae6e81f80833d04bac338ed

head               60446b8a8bd67320a7961211586485443a1c4239

Named refs at pin: 4ead77f938f8995fbae6e81f80833d04bac338ed ... HEAD

Read the diff:

git diff --find-renames 4ead77f938f8995fbae6e81f80833d04bac338ed 60446b8a8bd67320a7961211586485443a1c4239

Review concern 04 of 04: docs/eval.md (`docs`)

The why:

Stale eval docs cost agents time: a tmux and `AwaitShell` recipe that does not apply, a too-broad one-process rule, and no debrief or CI artifact guide [per the retro](source:s1).

The what:

"Long runs" now says to build once before parallel `run.ts` streams and to kill by cwd, and new sections cover debriefing a kept session, CI artifact paths, and known flaky expects.

Hunk refs for this concern:
- docs/eval.md