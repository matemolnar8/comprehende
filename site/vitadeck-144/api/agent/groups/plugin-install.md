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

Review concern 14 of 18: Plugin install and reload (`plugin-install`)

Part: Host Plugin Packages

The why:

[PR #145](source:s5) says a globally installed companion could not load a plugin installed somewhere else.

The what:

`install` stages and loads a package before renaming it into the plugins folder, and `start` reloads plugins when watched folders change.

Attention (risk):
`install` calls `loadHostPluginPackage` on the staged package, so its code runs with the user's permissions before any command and before the built-in id check. Once loaded, `server.ts` lets any Deck App on a linked Vita call any plugin, because the peer check knows only the IP. Decide whether that is enough before credentials exist.

Depends on:
- 12 Plugin package build (`plugin-build`)

Hunk refs for this concern:
- js/packages/host-companion/src/plugin.ts
- js/packages/host-companion/src/cli.ts
- js/packages/host-companion/test/cli.test.ts
- js/packages/host-companion/test/fixtures/greeter-plugin.ts
- js/packages/host-companion/test/fixtures/greeting.cjs
- js/packages/host-companion/test/fixtures/greeting.d.cts
- js/packages/host-companion/test/fixtures/plugin-package.ts