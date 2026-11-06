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

Review concern 02 of 26: Shared contract fixtures (`fixtures`)

Part: Host Control

The what:

Ten request and reply pairs that the SDK, the companion and the C link harness replay, per [#109](source:s2).

Depends on:
- 01 SDK plugin contract (`contract`)

Hunk refs for this concern:
- tests/fixtures/host-control/capabilities.json
- tests/fixtures/host-control/command-version-mismatch.json
- tests/fixtures/host-control/echo.json
- tests/fixtures/host-control/invalid-payload.json
- tests/fixtures/host-control/link-invalid-url.json
- tests/fixtures/host-control/link-ok.json
- tests/fixtures/host-control/link-relink-unknown.json
- tests/fixtures/host-control/link-version-mismatch.json
- tests/fixtures/host-control/unknown-command.json
- tests/fixtures/host-control/unknown-plugin.json