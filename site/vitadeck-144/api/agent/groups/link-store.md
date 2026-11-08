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

Review concern 05 of 14: Native link store and getter (`link-store`)

Part: Host Control

The what:

`link.c` validates `POST /link` bodies and keeps up to 4 links, newest first; `nativeGetHostControlLinks` hands them to Deck Apps as JSON.

Attention (product):
`host_control_links_save` puts a new id first and drops the oldest past 4. A fifth computer silently evicts the oldest link. That companion's next `start` relinks, gets 404 `unknown_link`, and removes the Vita from its `vitas`.

Questions:
- Why does a relink keep the link's place while a plain `link` moves it first?

Depends on:
- 04 Shared replace-file and JSON helpers (`native-helpers`)
- 02 Wire contract and SDK client (`contract`)

Hunk refs for this concern:
- src/host_control/link.c
- src/host_control/link.h
- src/jslib/host_control.c
- src/jslib/jslib.c
- src/jslib/jslib_internal.h
- src/core/bootstrap.c
- tests/host_control_link_harness.c
- CMakeLists.txt@151+151
- CMakeLists.txt@177+179
- CMakeLists.txt@284+287