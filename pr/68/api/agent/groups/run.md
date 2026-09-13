Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 61f79cce8191e348bcd1d72ade335b4c47c18ad9` and `git rev-parse --verify 603bbf138873e1fab673ef73d0a8238cc225190a` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 61f79cce8191e348bcd1d72ade335b4c47c18ad9 603bbf138873e1fab673ef73d0a8238cc225190a -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
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

Review concern 06 of 08: `pnpm eval` orchestrator (`run`)

Part: Report grader

The why:

The [design](source:s3) wants one command after skill, schema, or review changes, with one stdout line per case.

The what:

`runEval` walks cases, prints one line each, exports the produced review, and exits 1 only when a deterministic check fails. Package scripts, gitignore, and AGENTS.md wire that command.

Look for:
- `caseFailed` is true only for producer errors, validate errors, and `checks.failures`. LLM findings stay on the line as `nM nm`.
- Subtle. `durationMs` is set before `writeCaseArtifacts`, so `result.json` matches the summary line.

Depends on:
- 03 Isolated producer (`producer`)
- 04 Deterministic checks (`checks`)
- 05 Read-only graders (`graders`)

Hunk refs for this concern:
- scripts/eval/run.ts @@ -0,0 +1,254 @@
- scripts/eval/result.ts @@ -0,0 +1,165 @@
- package.json @@ -14,8 +14,10 @@
- package.json @@ -50,6 +52,7 @@
- .gitignore @@ -8,4 +8,6 @@
- scripts/tsconfig.json @@ -0,0 +1,11 @@
- AGENTS.md @@ -90,6 +90,8 @@