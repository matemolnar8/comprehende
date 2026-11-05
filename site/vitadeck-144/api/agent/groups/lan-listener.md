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

Review concern 05 of 14: One always-on LAN Listener replaces the upload server (`lan-listener`)

Part: Host Control

The why:

[The body](source:s-pr) says linking only from the Host Control screen felt clunky in testing, so links share an always-on listener with Runtime Upload. [#111](source:s-111) asks for the shared parsing in `src/net/`.

The what:

`lan_listener.c` takes over the upload routes from the deleted `http_server.c` and adds `POST /link`, using request parsing moved to `net/http.c` and an address from `src/platform/lan_address_*`.

Attention (risk):
[The body](source:s-pr) accepts that anyone on the LAN can upload a Deck App or add a link whenever VitaDeck runs. `POST /link` with any valid `id` and `url` puts that link first, so a default `createHostClient` then sends its commands there. Turning the listener off lasts only until the next launch, so decide whether always-on without credentials is the right default on a shared network.

Depends on:
- 04 Native link store and getter (`link-store`)

Hunk refs for this concern:
- CMakeLists.txt
- src/core/bootstrap.c
- src/main.c
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