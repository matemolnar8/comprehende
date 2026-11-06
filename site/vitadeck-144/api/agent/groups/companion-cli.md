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

Review concern 15 of 26: Companion CLI (`companion-cli`)

Part: Host Control

The what:

Runs `start`, `link`, `install`, `remove` and `notify`. On start it relinks each linked Vita, one attempt at a time.

Attention (risk):
`install` loads a package's code into the running companion, so its commands run with your permissions. Before the rename, `install` adds only the load and the built-in id check.

Depends on:
- 11 Companion HTTP server (`companion-server`)
- 14 Companion link to a Vita (`companion-link`)
- 12 Companion plugin loader (`companion-plugins`)
- 13 Companion built-in plugins (`companion-builtins`)

Hunk refs for this concern:
- js/packages/host-companion/src/cli.ts
- js/packages/host-companion/test/cli.test.ts