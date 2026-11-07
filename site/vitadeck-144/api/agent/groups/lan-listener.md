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

Review concern 04 of 18: LAN Listener serves uploads, links (`lan-listener`)

Part: Host Control

The why:

After testing, the separate link listener felt clunky, [PR #144](source:s1) says, so links share the always-on LAN Listener.

The what:

The upload server becomes the LAN Listener, which also answers `POST /link` and starts at boot. Its request parsing and JSON replies move into `net/http.c`.

Attention (risk):
The listener runs from boot, and `POST /link` and `POST /upload` answer any LAN peer. `handler_thread` picks the route from the request line, and nothing checks the peer or a credential first. A peer can add a link or install a Deck App whenever VitaDeck runs, which ADR 0004 accepts until credentials exist.

Depends on:
- 03 Link store and getter (`link-store`)

Hunk refs for this concern:
- src/net/http.c
- src/net/http.h
- src/net/lan_listener.c
- src/net/lan_listener.h
- src/platform/lan_address.h
- src/platform/lan_address_posix.c
- src/platform/lan_address_vita.c
- src/upload/http_parse.c
- src/upload/http_parse.h
- src/upload/http_server.c
- src/upload/http_server.h
- tests/upload_parsing_harness.c
- tests/upload_single_flight_harness.c