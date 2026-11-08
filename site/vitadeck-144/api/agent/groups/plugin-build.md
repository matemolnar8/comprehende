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

Review concern 11 of 14: SDK CLI builds plugin packages (`plugin-build`)

Part: Host Plugin Packages

The why:

[PR #145](source:s5) says a custom plugin used to need an npm package of its own.

The what:

`vitadeck build` writes `<slug>.vdplugin` and its zip from `hostPlugin`, and `create --host-plugin` lays a plugin over the Deck App scaffold.

Attention (tradeoff):
`buildHostPlugin` bundles every import except Node built-ins into one `companion.mjs`. A dependency with a native addon cannot ship this way. The SDK README says pure JavaScript only, and sends other files to `hostPlugin.files`, which `cp` copies with links dereferenced.

Hunk refs for this concern:
- js/packages/sdk/cli/cli.ts@1+1
- js/packages/sdk/cli/cli.ts@7+7
- js/packages/sdk/cli/cli.ts@34+38
- js/packages/sdk/cli/cli.ts@102+107
- js/packages/sdk/cli/cli.ts@186+201
- js/packages/sdk/cli/cli.ts@232+252
- js/packages/sdk/cli/cli.ts@366+387
- js/packages/sdk/cli/cli.ts@450+573
- js/packages/sdk/cli/cli.ts@551+703
- js/packages/sdk/cli/cli.ts@565+725
- js/packages/sdk/cli/cli.ts@613+775
- js/packages/sdk/cli/cli.ts@628+790
- js/packages/sdk/cli/cli.ts@636+801
- js/packages/sdk/cli/cli.ts@657+833
- js/packages/sdk/cli/cli.ts@692+868
- js/packages/sdk/cli/cli.test.ts@1+1
- js/packages/sdk/cli/cli.test.ts@61+71
- js/packages/sdk/cli/copy-templates.ts
- js/packages/sdk/cli/test-project.ts@15+15
- js/packages/sdk/cli/test-project.ts@43+45
- js/packages/sdk/cli/templates/host-plugin/host/companion.ts
- js/packages/sdk/cli/templates/host-plugin/host/plugin.ts
- js/packages/sdk/cli/templates/host-plugin/host/tsconfig.json
- js/packages/sdk/cli/templates/host-plugin/package.json
- js/packages/sdk/cli/templates/host-plugin/src/App.tsx
- js/packages/sdk/cli/templates/host-plugin/vitadeck.config.json
- js/package.json@22+24