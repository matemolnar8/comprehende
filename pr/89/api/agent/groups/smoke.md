Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff` and `git rev-parse --verify 0cca95f6572e35edba92ee70c70ee4edf20bb4cf` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff 0cca95f6572e35edba92ee70c70ee4edf20bb4cf -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff

head               0cca95f6572e35edba92ee70c70ee4edf20bb4cf

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff 0cca95f6572e35edba92ee70c70ee4edf20bb4cf

Review concern 05 of 06: Fixture UI smoke (`smoke`)

Part: UI smoke

The why:

[#86](source:s2) wants one documented command that smokes the mixed fixture without Playwright.

The what:

`scripts/fixture-smoke.ts` serves the mixed fixture on port 4579, fetches `#overview` and `#group/app`, then closes the server.

Look for:
- After `pnpm fixture:smoke`, the process exits and nothing still listens on port 4579.

Hunk refs for this concern:
- scripts/fixture-smoke.ts @@ -0,0 +1,118 @@