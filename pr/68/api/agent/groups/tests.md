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

Review concern 07 of 08: Eval unit tests (`tests`)

Part: Report grader

The why:

The new helpers need tests that do not call the SDK.

The what:

Case schema, argv, GitHub URLs, checks, packet, graders JSON, skill copy, and `replaceCliPin` have node:test coverage.

Depends on:
- 06 `pnpm eval` orchestrator (`run`)

Hunk refs for this concern:
- scripts/eval/args.test.ts @@ -0,0 +1,33 @@
- scripts/eval/case.test.ts @@ -0,0 +1,76 @@
- scripts/eval/checks.test.ts @@ -0,0 +1,215 @@
- scripts/eval/github.test.ts @@ -0,0 +1,63 @@
- scripts/eval/graders.test.ts @@ -0,0 +1,53 @@
- scripts/eval/packet.test.ts @@ -0,0 +1,33 @@
- scripts/eval/skill.test.ts @@ -0,0 +1,30 @@
- src/schema/skill-sync.test.ts @@ -3,7 +3,7 @@
- src/schema/skill-sync.test.ts @@ -124,6 +124,16 @@