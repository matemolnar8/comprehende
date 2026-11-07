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

Review concern 05 of 18: LAN Listener replaces upload server (`lan-listener`)

Part: Link and call

The why:

[PR #144](source:s1) says setup felt clunky when links listened only on the Host Control screen.

The what:

`lan_listener.c` replaces the upload server with one listener for `/upload` and `/link`, and `net/http.c` takes the request parsing.

Attention (risk):
`handler_thread` routes `POST /upload` and `POST /link` with no peer or credential check, from boot. A LAN peer can publish a Deck App, or post a link with an `id` it chooses; `host_control_links_save` puts that link first, and four such posts push out every real link. [PR #144](source:s1) accepts this until credentials exist. Decide whether on-by-default is right.

Depends on:
- 03 Shared native helpers (`native-helpers`)
- 04 Link store and getter (`link-store`)

Hunk refs for this concern:
- src/net/lan_listener.c
- src/net/lan_listener.h
- src/net/http.c
- src/net/http.h
- src/platform/lan_address.h
- src/platform/lan_address_posix.c
- src/platform/lan_address_vita.c
- src/main.c
- src/upload/http_parse.c
- src/upload/http_parse.h
- src/upload/http_server.c
- src/upload/http_server.h
- tests/upload_parsing_harness.c
- tests/upload_single_flight_harness.c