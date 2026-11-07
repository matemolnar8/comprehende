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

Review concern 08 of 13: Native link store and getter (`native-link`)

The what:

`link.c` parses `POST /link` bodies and keeps up to 4 links in `host-control-links.json`, newest first, and `jslib/host_control.c` exposes them as `nativeGetHostControlLinks`. `bootstrap.c` loads the store at boot and fails startup if it cannot.

Attention (product):
`host_control_links_save` puts a new companion id first and drops the oldest past `VD_HOST_CONTROL_MAX_LINKS` (4) without telling anyone. Linking a fifth computer silently forgets the least recently linked one. That companion's next `start` relink then gets `unknown_link` and removes this Vita from its config.

Questions:
- Why does `VD_HOST_CONTROL_MAX_LINKS` cap VitaDeck at 4 linked computers?

Depends on:
- 07 Shared JSON and file-replace helpers (`json-file-helpers`)
- 01 Wire contract and plugin registry (`contract`)

Hunk refs for this concern:
- src/host_control/link.c
- src/host_control/link.h
- src/jslib/host_control.c
- src/jslib/jslib.c
- src/jslib/jslib_internal.h
- src/core/bootstrap.c
- CMakeLists.txt@151+151
- CMakeLists.txt@177+179
- CMakeLists.txt@284+287
- tests/host_control_link_harness.c