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

Review concern 04 of 14: Native link store and getter (`link-store`)

Part: Host Control

The why:

A Deck App has to find the linked computers. [#111](source:s-111) asks for a pure parser and a persisted store, and [the body](source:s-pr) extends it to several links, one per companion id.

The what:

`link.c` parses and persists links in `host-control-links.json`, and `nativeGetHostControlLinks` in `src/jslib/host_control.c` hands the same list to JS as a JSON array.

Questions:
- Why does `host_control_links_save` silently evict the oldest link instead of refusing a new link when the store is full?

Depends on:
- 03 Shared JSON and file-replace helpers (`native-foundation`)

Hunk refs for this concern:
- src/host_control/link.c
- src/host_control/link.h
- src/jslib/host_control.c
- src/jslib/jslib.c
- src/jslib/jslib_internal.h
- js/packages/runtime/src/runtime-native.d.ts
- tests/host_control_link_harness.c