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

Named refs at pin: a447e3b9 ... ae5083ca

Read the diff:

git diff --find-renames a447e3b960dc1c5434b9fbc2f45c112b1c630b1f ae5083caa9370b5f5985de1de0aa147a1afecc2e

Review concern 03 of 13: Companion server and events (`companion-server`)

The what:

`startHostCompanion` serves `POST /command`, checking route, method, content type, size, version, plugin, command and payload guard in order, and `events.ts` holds `core.events` waits until the plugin emits. As [chatgpt-codex-connector asked](source:s6), `reply` checks the peer before reading the body.

Attention (risk):
`isAllowed` answers every peer while the config's `vitas` list is empty, so a companion that was started but never linked serves any LAN host. Once linked, it answers those Vita IPs, loopback and this computer's own addresses, all spoofable. The built-ins only read, so today the exposure is `echo`, `notify`, system stats, and any installed custom plugin.

Depends on:
- 01 Wire contract and plugin registry (`contract`)

Hunk refs for this concern:
- js/packages/host-companion/src/server.ts
- js/packages/host-companion/src/core.ts
- js/packages/host-companion/src/events.ts
- js/packages/host-companion/src/system-stats.ts
- js/packages/host-companion/test/server.test.ts
- js/packages/host-companion/package.json
- js/packages/host-companion/rolldown.config.mjs
- js/packages/host-companion/tsconfig.json
- js/package.json
- scripts/agent-check.sh
- .gitignore