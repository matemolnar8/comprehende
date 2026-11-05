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

Review concern 03 of 04: Run loop: trials, jobs, keep (`runner`)

The why:

Two sessions wrote throwaway harnesses to run one case 20 times and to compare skill variants, and a debrief needs the producer's clone [after the case ends](source:s1).

The what:

`runEval` snapshots the skill once, expands each case into `--repeat` trials, and runs them through `mapPool` with `--jobs` in flight; `caseKey` names each trial `<id>.t<n>` in folders, lines, and the report.

Attention (contract):
With `--repeat 1` (the default) case folders stay `<id>/`, so CI artifacts and `--baseline` keep their paths. A repeated run writes `<id>.t<n>/`, so `--rescore` and `--baseline` on it need the same `--repeat` to find each trial.

Depends on:
- 01 Skill snapshot per run (`snapshot`)
- 02 Shared clone cache and worktree .env (`cache`)

Hunk refs for this concern:
- scripts/eval/run.ts
- scripts/eval/args.ts
- scripts/eval/args.test.ts
- scripts/eval/result.ts
- scripts/eval/report.ts
- scripts/eval/report.test.ts