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

Review concern 03 of 14: Host Companion server and link (`companion`)

Part: Host Control

The what:

`vitadeck-host-companion` serves typed commands on port 8797, links itself to Vitas, and relinks them on every `start`. `reply` checks the peer before it reads the body, as [the Codex comment](source:s6) asked.

Attention (risk):
While `vitas` is empty, `isAllowed` answers every peer. After a link, only those IPs, loopback and the computer's own addresses get answers; any other peer gets 403 `forbidden`. IPs can be spoofed; the README accepts that because the built-in plugins only read.

Questions:
- Why does `config.vitas` keep only the Vita IP, not the port given to `link`?

Depends on:
- 02 Wire contract and SDK client (`contract`)

Hunk refs for this concern:
- js/packages/host-companion/src/server.ts
- js/packages/host-companion/src/core.ts
- js/packages/host-companion/src/link.ts
- js/packages/host-companion/src/config.ts
- js/packages/host-companion/src/system-stats.ts
- js/packages/host-companion/src/cli.ts
- js/packages/host-companion/rolldown.config.mjs
- js/packages/host-companion/package.json
- js/packages/host-companion/tsconfig.json
- js/packages/host-companion/test/link.test.ts
- js/packages/host-companion/test/server.test.ts
- js/packages/host-companion/README.md
- js/package.json@5+5
- .gitignore
- scripts/agent-check.sh