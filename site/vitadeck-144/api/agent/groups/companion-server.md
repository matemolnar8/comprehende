Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a447e3b960dc1c5434b9fbc2f45c112b1c630b1f` and `git rev-parse --verify ae5083caa9370b5f5985de1de0aa147a1afecc2e` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a447e3b960dc1c5434b9fbc2f45c112b1c630b1f ae5083caa9370b5f5985de1de0aa147a1afecc2e -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: vitadeck
Origin: git@github.com:matemolnar8/vitadeck.git

base (merge-base)  a447e3b960dc1c5434b9fbc2f45c112b1c630b1f

head               ae5083caa9370b5f5985de1de0aa147a1afecc2e

Named refs at pin: a447e3b960dc1c5434b9fbc2f45c112b1c630b1f ... ae5083caa9370b5f5985de1de0aa147a1afecc2e

Read the diff:

git diff --find-renames a447e3b960dc1c5434b9fbc2f45c112b1c630b1f ae5083caa9370b5f5985de1de0aa147a1afecc2e

Review concern 08 of 18: Companion answers linked peers (`companion-server`)

Part: Host Control

The what:

`startHostCompanion` serves `POST /command`, checks the peer before reading the body, as [a Codex review](source:s2) asked, and routes to a loaded plugin.

Attention (risk):
Until a Vita links, `isAllowed` returns true for every peer, and `start` listens on `0.0.0.0`. Any LAN peer can then call every loaded command, including installed plugins, which run with the user's permissions. Once a link exists, only that Vita's address, loopback and this computer's own addresses get answers.

Questions:
- Why does `isAllowed` admit every peer until a Vita links, instead of refusing?

Depends on:
- 01 Wire contract and plugin registry (`contract`)

Hunk refs for this concern:
- js/packages/host-companion/src/core.ts
- js/packages/host-companion/src/server.ts
- js/packages/host-companion/src/system-stats.ts
- js/packages/host-companion/test/server.test.ts