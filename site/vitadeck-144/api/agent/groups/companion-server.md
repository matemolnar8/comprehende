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

Review concern 08 of 18: Companion server and built-ins (`companion-server`)

Part: Link and call

The what:

`startHostCompanion` checks the peer, then the route and payload, then runs the command, as [Codex asked](source:s6). `core.ts` and `system-stats.ts` implement the built-ins.

Attention (risk):
`isAllowed` answers every peer while `vitas()` is empty. Forgetting the only link in the Shell [empties `vitas` on the next `start`](source:s1), so a companion on `0.0.0.0` then serves any LAN peer, installed plugins included. [#110](source:s3) asks for the peer check only once linked. Decide whether an emptied list should reopen the companion.

Depends on:
- 01 Wire contract and plugin registries (`contract`)

Hunk refs for this concern:
- js/packages/host-companion/src/server.ts
- js/packages/host-companion/src/core.ts
- js/packages/host-companion/src/system-stats.ts
- js/packages/host-companion/test/server.test.ts