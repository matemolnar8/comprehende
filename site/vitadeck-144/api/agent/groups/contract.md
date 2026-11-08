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

Review concern 02 of 14: Wire contract and SDK client (`contract`)

Part: Host Control

The what:

`@vitadeck/sdk/host-control` defines plugins, the wire error codes and a client that reads VitaDeck's links on every call. The SDK, companion and C harness tests replay the same fixture files.

Attention (contract):
`send` races the transport against a `setTimeout`, because the Vita `fetch` has no `AbortSignal`. A command that takes 6 s resolves `timeout` at 5 s, but the native request keeps running and the companion still runs it. Callers must read `timeout` as "may have run"; the client never retries.

Hunk refs for this concern:
- js/packages/sdk/src/host-control/protocol.ts
- js/packages/sdk/src/host-control/plugin.ts
- js/packages/sdk/src/host-control/client.ts
- js/packages/sdk/src/host-control/index.ts
- js/packages/sdk/src/host-control/system-stats.ts
- js/packages/sdk/test/host-control.test.ts
- tests/fixtures/host-control/capabilities.json
- tests/fixtures/host-control/command-version-mismatch.json
- tests/fixtures/host-control/echo.json
- tests/fixtures/host-control/invalid-payload.json
- tests/fixtures/host-control/link-invalid-url.json
- tests/fixtures/host-control/link-ok.json
- tests/fixtures/host-control/link-relink-unknown.json
- tests/fixtures/host-control/link-version-mismatch.json
- tests/fixtures/host-control/unknown-command.json
- tests/fixtures/host-control/unknown-plugin.json
- js/packages/sdk/package.json
- js/packages/sdk/tsconfig.json
- js/packages/sdk/src/deck-app-globals.d.ts
- js/packages/runtime/src/runtime-native.d.ts
- js/packages/sdk/cli/package-format.test.ts
- js/packages/sdk/cli/test-project.ts@43+45