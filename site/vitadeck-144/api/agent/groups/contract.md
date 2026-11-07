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

Review concern 01 of 13: Wire contract and plugin registry (`contract`)

The what:

`protocol.ts` fixes the wire codes and request shapes, and `plugin.ts` defines plugins that Deck Apps import and the companion implements. The ten JSON fixtures pin the bytes that the SDK, companion and C harness all replay.

Attention (contract):
`ImplementedHostPlugin` (a string `id` plus a `ReadonlyMap` of `isPayload`/`run`) and `HOST_PLUGIN_SCHEMA_VERSION` 1 are what a `.vdplugin` built with one SDK promises a companion of another. Each package bundles its own copy of this module, so the companion matches that shape, and `HostCommandError` by `name`, not by class. Renaming the error class or changing `commands` from a `Map` breaks every package already built.

Hunk refs for this concern:
- js/packages/sdk/src/host-control/protocol.ts
- js/packages/sdk/src/host-control/plugin.ts
- js/packages/sdk/src/host-control/system-stats.ts
- js/packages/sdk/src/host-control/index.ts
- js/packages/sdk/package.json@41+41
- js/packages/sdk/cli/package-format.test.ts
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