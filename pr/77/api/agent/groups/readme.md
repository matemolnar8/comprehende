Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 95879630ef53ba6bd6da25c6958a19fe06786fe0` and `git rev-parse --verify 25c1447e9c9388f263b685a884edb25c8b7bde9b` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 25c1447e9c9388f263b685a884edb25c8b7bde9b -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  95879630ef53ba6bd6da25c6958a19fe06786fe0

head               25c1447e9c9388f263b685a884edb25c8b7bde9b

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 25c1447e9c9388f263b685a884edb25c8b7bde9b

Review concern 06 of 06: README command (`readme`)

Part: README

The why:

The README still listed only index, validate, serve, and export.

The what:

The README documents `compare --from --to` with `--json` and `--open`.

Hunk refs for this concern:
- README.md @@ -81,3 +81,15 @@