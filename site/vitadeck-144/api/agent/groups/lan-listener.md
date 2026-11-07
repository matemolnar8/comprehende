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

Review concern 09 of 13: LAN Listener on from boot (`lan-listener`)

The what:

The upload server becomes `lan_listener.c` with a `POST /link` route, its HTTP helpers move to `src/net/http.c`, and `main.c` starts it at boot. [PR #144](source:s1) says the Vita VPK builds, but nothing was tested on hardware.

Attention (risk):
`shell_start_listener` in `main.c` binds the LAN Listener on all interfaces at boot, and nothing checks who calls `POST /upload` or `POST /link`. While VitaDeck runs, anyone on the LAN can install or replace a Deck App, the active one included, or add a link that points Deck Apps at their own server. Turning **Upload and link** off lasts only until VitaDeck restarts.

Depends on:
- 08 Native link store and getter (`native-link`)

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
- CMakeLists.txt@137+137
- CMakeLists.txt@177+179
- js/packages/sdk/cli/cli.ts@514+663
- js/packages/sdk/cli/dev.test.ts
- .agents/skills/vitadeck-vdapp-upload/scripts/upload-vdapp.sh
- tests/upload_parsing_harness.c
- tests/upload_single_flight_harness.c