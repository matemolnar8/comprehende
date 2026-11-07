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

Review concern 02 of 13: Deck App client and event watching (`client`)

The what:

`client.ts` turns a plugin into typed methods that resolve to `HostResult` and never reject, reading the links from `nativeGetHostControlLinks` on every call. `watchHostEvents` keeps one `core.events` wait open, passing `next` back as `after`.

Attention (tradeoff):
The Vita `fetch` has no `AbortSignal`, so `send` races the request against a 5 s timer and never retries. After a `timeout` the native request keeps running up to curl's 30 s cap, and the command may still run on the computer. `watchHostEvents` therefore waits 30 s before retrying a timed-out wait, and gives each wait 29 s against the companion's 25 s hold.

Depends on:
- 01 Wire contract and plugin registry (`contract`)

Hunk refs for this concern:
- js/packages/sdk/src/host-control/client.ts
- js/packages/sdk/test/host-control.test.ts
- js/packages/runtime/src/runtime-native.d.ts
- js/packages/sdk/src/deck-app-globals.d.ts
- js/packages/sdk/package.json@62+67
- js/packages/sdk/tsconfig.json