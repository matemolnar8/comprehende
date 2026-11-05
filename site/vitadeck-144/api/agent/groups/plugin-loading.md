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

Review concern 08 of 14: Companion loads, installs and hot-reloads `.vdplugin` packages (`plugin-loading`)

Part: Host Control

The why:

[#145](source:s-145) says a custom plugin meant an npm package of its own, and a globally installed companion could not load one installed somewhere else.

The what:

`install` in `cli.ts` stages a package with `extractHostPluginArchive`, proves it with `loadHostPluginPackage` and renames it into place, and `start` reloads it through `setPlugins` when files change.

Attention (risk):
A package runs with the user's permissions, and nothing limits what its commands do. [#145](source:s-145) holds back computer-acting built-ins for the credentials decision, yet an installed custom plugin can act on the computer for any allowed peer today. Decide whether the warning in the `install` usage text is enough until credentials exist.

Questions:
- Why does `install` import the package's entry to learn its plugin id, when the manifest could carry that id?

Depends on:
- 02 Companion command server, peer check and built-ins (`companion-server`)

Hunk refs for this concern:
- js/packages/host-companion/src/plugin.ts
- js/packages/host-companion/src/cli.ts
- js/packages/host-companion/test/cli.test.ts
- js/packages/host-companion/test/fixtures/greeter-plugin.ts
- js/packages/host-companion/test/fixtures/greeting.cjs
- js/packages/host-companion/test/fixtures/greeting.d.cts
- js/packages/host-companion/test/fixtures/plugin-package.ts