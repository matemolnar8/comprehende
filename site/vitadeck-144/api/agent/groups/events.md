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

Review concern 09 of 14: Events by long-polling (`events`)

Part: Host Control Events

The why:

No ticket asks for events; [PR #144](source:s1) adds them so plugins can push to Deck Apps.

The what:

Plugins emit events from a `start` lifecycle into the companion's event log, and `core.events` holds each request until the plugin's next event or 25 s. `watchHostEvents` in the SDK keeps one such request open per watcher.

Attention (tradeoff):
`wait` reads an `after` above the current `seq` as a restart and starts over from now. If a restarted companion emits 3 events before a wait with `after: 57`, the reply is `{ events: [], next: 3 }` and those 3 are lost. After 60 events it returns only 58 to 60. The ADR calls events best effort.

Hunk refs for this concern:
- js/packages/host-companion/src/events.ts
- js/packages/host-companion/src/core.ts
- js/packages/sdk/src/host-control/client.ts
- js/packages/sdk/test/host-control.test.ts