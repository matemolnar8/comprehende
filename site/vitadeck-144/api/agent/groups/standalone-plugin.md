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

Review concern 13 of 14: Standalone plugin projects (`standalone-plugin`)

Part: Standalone Host Plugins

The why:

No ticket asks for standalone plugins; [PR #144](source:s1) adds them so any Deck App can depend on one.

The what:

`create --host-plugin-only` scaffolds a project with only `host/`, and its `package.json` exports the commands for Deck Apps to depend on.

Attention (contract):
`readConfig` no longer requires `entry`; a config needs `entry`, `hostPlugin`, or both. `vitadeck dev 192.168.1.50` on a plugin-only project fails with "no Deck App to upload", and `vitadeck dev` with no URL on a Deck App prints the usage.

Hunk refs for this concern:
- js/packages/sdk/cli/templates/host-plugin-only/.gitignore
- js/packages/sdk/cli/templates/host-plugin-only/package.json
- js/packages/sdk/cli/templates/host-plugin-only/vitadeck.config.json
- js/packages/sdk/cli/cli.ts@102+107
- js/packages/sdk/cli/cli.ts@551+703
- js/packages/sdk/cli/cli.ts@565+725
- js/packages/sdk/cli/cli.ts@613+775
- js/packages/sdk/cli/cli.ts@628+790
- js/packages/sdk/cli/cli.ts@636+801
- js/packages/sdk/cli/cli.ts@692+868
- js/packages/sdk/cli/cli.test.ts@61+71