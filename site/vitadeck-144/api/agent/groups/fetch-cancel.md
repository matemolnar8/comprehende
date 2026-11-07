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

Review concern 11 of 13: Cancel fetches when a Deck App stops (`fetch-cancel`)

The why:

[PR #144](source:s1) needs a held event wait not to stall a reload.

The what:

`fetch_shutdown` marks every pending request cancelled, and the new curl progress callback aborts it. `js_limits_harness` stops a Deck App whose fetch waits on a server that never answers.

Attention (tradeoff):
curl aborts a cancelled transfer only at its next progress callback, about once a second. Stopping a Deck App can still wait about a second for held event waits, instead of up to 30 s. The progress callback, with its mutex lock, now runs on every Deck App fetch.

Depends on:
- 02 Deck App client and event watching (`client`)

Hunk refs for this concern:
- src/jslib/fetch.c
- tests/js_limits_harness.c