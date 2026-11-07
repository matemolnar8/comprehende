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

Review concern 04 of 13: Companion linking and relink (`companion-link`)

The why:

[PR #144](source:s1) wants a new computer IP or port to reach linked Vitas without running `link` again.

The what:

`linkVita` checks that `start` answers on loopback, picks the interface routed to the Vita, and posts the link; `relink` in `cli.ts` replays it for each saved Vita on every `start`. A Vita that answers `unknown_link` is removed from `vitas`.

Attention (tradeoff):
The config stores Vita IPs without ports, and `relink` calls `linkVita(vita, …)`, which defaults to port 8787. A Vita whose LAN Listener fell forward to 8788 refuses the connection, which `linkVita` marks `retry: true`, so the companion retries it every 30 s for as long as it runs. The companion README says such a Vita needs `link` again.

Depends on:
- 03 Companion server and events (`companion-server`)

Hunk refs for this concern:
- js/packages/host-companion/src/link.ts
- js/packages/host-companion/src/config.ts
- js/packages/host-companion/test/link.test.ts
- js/packages/host-companion/src/cli.ts