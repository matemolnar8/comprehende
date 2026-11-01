Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify de6c86b23284d2dc40e2633828c3854e1e8e6b1a` and `git rev-parse --verify 02739aebc0a4f3928a5867376d0363b45591795d` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames de6c86b23284d2dc40e2633828c3854e1e8e6b1a 02739aebc0a4f3928a5867376d0363b45591795d -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  de6c86b23284d2dc40e2633828c3854e1e8e6b1a

head               02739aebc0a4f3928a5867376d0363b45591795d

Named refs at pin: origin/main ... t3/agent-deep-links

Read the diff:

git diff --find-renames de6c86b23284d2dc40e2633828c3854e1e8e6b1a 02739aebc0a4f3928a5867376d0363b45591795d

Review concern 02 of 03: Agent targets and the shared choice (`targets`)

The why:

Each app has its own deep link, and [one Claude Code option opens the desktop app](source:s2).

The what:

`AGENT_TARGETS` maps each app to a function that builds its link from the prompt and `repo`, and `AgentTargetProvider` in `App.tsx` shares the stored choice with every button; most `App.tsx` lines only move one indent level.

Attention (product):
Claude Code opens the desktop app with `claude://code/new?q=`, which has no local folder parameter. Under `serve` too, the reader picks the folder in Desktop; only Codex gets the work tree as `path`.

Depends on:
- 01 Work tree path in the review payload (`repo-root`)

Hunk refs for this concern:
- src/ui/lib/agent-targets.ts
- src/ui/lib/agent-targets.test.ts
- src/ui/lib/AgentTargetProvider.tsx
- src/ui/App.tsx