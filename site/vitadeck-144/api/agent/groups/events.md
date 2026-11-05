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

Review concern 12 of 14: Host events by long-polling (`events`)

Part: Host events

The why:

[The body](source:s-pr) wants plugins to push events to Deck Apps the moment something happens on the computer, and it says ADR 0004 rejects WebSocket, SSE and a Vita listener. [Lifecycles start only after the port binds](source:k-lifecycle), so a busy port leaves no plugin timer running.

The what:

A plugin's `start(emit)` lifecycle feeds `events.ts`, `core.events` holds a request on that log for up to 25 s, and `watchHostEvents` keeps one such request open.

Hunk refs for this concern:
- js/packages/host-companion/src/events.ts
- js/packages/host-companion/src/core.ts
- js/packages/host-companion/src/server.ts
- js/packages/host-companion/test/server.test.ts
- js/packages/sdk/src/host-control/client.ts
- js/packages/sdk/src/host-control/plugin.ts
- js/packages/sdk/test/host-control.test.ts