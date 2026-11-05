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

Review concern 13 of 14: Native fetch cancels when a Deck App stops (`fetch-cancel`)

Part: Host events

The why:

A held event wait must not stall a reload. [The body](source:s-pr) measures 15 s before the fix and under 3 s after.

The what:

`fetch_shutdown` marks every pending request cancelled, and the new curl progress callback in `fetch.c` aborts each transfer, which `js_limits_harness` proves with a server that never answers.

Attention (contract):
This applies to every fetch of every Deck App, not only event waits. A Deck App that sends a `POST` and then stops used to wait in `fetch_shutdown` until the transfer finished. Now that transfer aborts at curl's next progress call and the request may not complete, so decide whether a reload may drop in-flight writes.

Depends on:
- 12 Host events by long-polling (`events`)

Hunk refs for this concern:
- src/jslib/fetch.c
- tests/js_limits_harness.c