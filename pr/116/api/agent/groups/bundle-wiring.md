Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 4c59452449c16ba800b5753c21f1202692cc242c` and `git rev-parse --verify 993e40a2b984d0c2f4979f8367190719f4c7b97e` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 4c59452449c16ba800b5753c21f1202692cc242c 993e40a2b984d0c2f4979f8367190719f4c7b97e -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  4c59452449c16ba800b5753c21f1202692cc242c

head               993e40a2b984d0c2f4979f8367190719f4c7b97e

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 4c59452449c16ba800b5753c21f1202692cc242c 993e40a2b984d0c2f4979f8367190719f4c7b97e

Review concern 02 of 05: Write and read bundles (`bundle-wiring`)

Part: Bundled cases

The why:

Uses the bundle helpers from the add-case command and from the runner.

The what:

`eval:add --bundle` writes `repo.bundle` next to `case.json`, and `runEval` opens that bundle in the temp dir instead of the shared clone cache.

Look for:
- When a case has `repo.bundle`, the runner skips `ensureBareClone` and `fetchCaseRefs`, so a stale bundle never falls back to the network.

Depends on:
- 01 Bundle a case's git history (`bundle`)

Hunk refs for this concern:
- scripts/eval/add-case.ts
- scripts/eval/args.ts
- scripts/eval/args.test.ts
- scripts/eval/run.ts