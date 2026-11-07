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

Review concern 15 of 18: Events by long-polling (`events`)

Part: Events

The what:

`core.events` holds a request until the plugin's next event, and `watchHostEvents` keeps one wait open, passing `next` as `after`.

Attention (tradeoff):
`watchHostEvents` keeps one native fetch open per watch, and `fetch.c` runs each fetch on its own thread. A computer that stops answering costs 29 s to time out and 30 s more to retry. [PR #144](source:s1) rejects WebSocket and SSE in ADR 0004. Decide whether a held thread per watch suits the Vita.

Questions:
- Why does `watchHostEvents` keep its `after` cursor when the resolved host changes?

Hunk refs for this concern:
- js/packages/host-companion/src/events.ts
- js/packages/host-companion/src/core.ts
- js/packages/sdk/src/host-control/client.ts
- js/packages/host-companion/test/server.test.ts
- js/packages/sdk/test/host-control.test.ts