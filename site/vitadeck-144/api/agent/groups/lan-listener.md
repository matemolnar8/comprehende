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

Review concern 06 of 14: One LAN Listener from boot (`lan-listener`)

Part: Host Control

The why:

[PR #144](source:s1) says a separate link listener felt clunky in testing, so links share this one.

The what:

The upload server becomes the LAN Listener with a `POST /link` route, and `main.c` starts it at boot. `vitadeck dev` and `vitadeck-host-companion link` now take the same address.

Attention (risk):
`main.c` calls `shell_start_listener` on every boot, also in Benchmark Mode, and `/upload` and `/link` check no peer. Anyone on the LAN can install a Deck App or add a link while VitaDeck runs, until **Upload and link** is turned off. The PR accepts this until credentials exist.

Depends on:
- 04 Shared replace-file and JSON helpers (`native-helpers`)
- 05 Native link store and getter (`link-store`)

Hunk refs for this concern:
- src/net/lan_listener.c
- src/net/lan_listener.h
- src/net/http.c
- src/net/http.h
- src/platform/lan_address.h
- src/platform/lan_address_posix.c
- src/platform/lan_address_vita.c
- src/upload/http_parse.c
- src/upload/http_parse.h
- src/upload/http_server.c
- src/upload/http_server.h
- src/main.c
- tests/upload_parsing_harness.c
- tests/upload_single_flight_harness.c
- CMakeLists.txt@137+137
- CMakeLists.txt@177+179
- js/packages/sdk/cli/cli.ts@514+663
- js/packages/sdk/cli/dev.test.ts