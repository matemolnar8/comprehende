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

Review concern 02 of 14: Companion command server, peer check and built-ins (`companion-server`)

Part: Host Control

The why:

[#110](source:s-110) asks for a companion that serves `POST /command` and answers only the linked Vita once linked. [Codex asked](source:c-codex) that the peer check run before the body is read.

The what:

`server.ts` answers an unlinked peer with [a 403 and discards its body unbuffered](source:c-mate), then checks the request and the plugin's payload guard before it runs a command from `core.ts` or `system-stats.ts`.

Attention (risk):
`isAllowed` returns true for every peer when `vitas` is empty. A companion that was never linked answers the whole LAN on `0.0.0.0`, and so does one whose last Vita was forgotten, because relink empties `vitas`. Installed plugins are then callable too, so decide whether an empty list should mean open or loopback-only.

Depends on:
- 01 Wire contract, plugin types and SDK client (`sdk-contract`)

Hunk refs for this concern:
- .gitignore
- js/package.json
- js/packages/host-companion/package.json
- js/packages/host-companion/rolldown.config.mjs
- js/packages/host-companion/tsconfig.json
- js/packages/host-companion/src/config.ts
- js/packages/host-companion/src/core.ts
- js/packages/host-companion/src/server.ts
- js/packages/host-companion/src/system-stats.ts
- js/packages/host-companion/test/server.test.ts
- scripts/agent-check.sh