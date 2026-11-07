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

Review concern 12 of 18: Plugin package build (`plugin-build`)

Part: Host Plugin Packages

The why:

[PR #145](source:s5) says a custom plugin used to mean an npm package of its own.

The what:

`build` writes a Deck App, a `.vdplugin` package and their zips, or only the plugin when `entry` is absent. A plugin-only `dev` rejects a URL and uploads nothing.

Attention (tradeoff):
`build` runs the Deck App and plugin builds in one call, and `buildDeckApp` deletes the old `.vdapp.zip` first. When the plugin fails, `build` throws before any archive is written, so `dev` uploads nothing that cycle and `dist` has no `.vdapp.zip`, while the last good `.vdplugin` survives. Decide whether one failure should block both.

Hunk refs for this concern:
- js/packages/sdk/cli/cli.ts@1+1
- js/packages/sdk/cli/cli.ts@7+7
- js/packages/sdk/cli/cli.ts@34+38
- js/packages/sdk/cli/cli.ts@102+107
- js/packages/sdk/cli/cli.ts@186+201
- js/packages/sdk/cli/cli.ts@232+252
- js/packages/sdk/cli/cli.ts@366+387
- js/packages/sdk/cli/cli.ts@450+573
- js/packages/sdk/cli/cli.ts@514+663
- js/packages/sdk/cli/cli.ts@551+703
- js/packages/sdk/cli/cli.ts@565+725
- js/packages/sdk/cli/cli.ts@613+775
- js/packages/sdk/cli/cli.ts@636+801
- js/packages/sdk/cli/cli.ts@692+868
- js/packages/sdk/cli/cli.test.ts
- js/packages/sdk/cli/package-format.test.ts
- js/packages/sdk/cli/dev.test.ts