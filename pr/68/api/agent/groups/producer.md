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

Review concern 03 of 08: Isolated producer (`producer`)

Part: Report grader

The why:

[#52](source:s1) requires an isolated agent to write the review from the skill. The [design](source:s3) forbids loading this repo's skills or the network.

The what:

`copySkillForEval` rewrites the CLI pin. `runLocalAgent` uses empty `settingSources` and disallows task, search, and MCP.

Look for:
- The producer prompt never mentions `expect` or `eval/cases`. Frozen sources skip `gh`.

Depends on:
- 02 Pin a PR into a worktree (`clone`)

Hunk refs for this concern:
- src/schema/cli-pin.ts @@ -12,6 +12,11 @@
- scripts/eval/skill.ts @@ -0,0 +1,37 @@
- scripts/eval/agent.ts @@ -0,0 +1,59 @@
- scripts/eval/producer.ts @@ -0,0 +1,36 @@