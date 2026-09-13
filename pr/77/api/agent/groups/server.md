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

Review concern 04 of 06: Compare HTTP server (`server`)

Part: Compare reviews

The why:

`--open` needs a server that serves the comparison without live git.

The what:

`startCompareServer` serves `/api/compare.json` and returns 404 for other `/api/*` routes.

Look for:
- Compare mode 404s `/api/review.json` and other live-git routes. The UI does not wait on a missing review payload.

Depends on:
- 01 Review comparison (`engine`)

Hunk refs for this concern:
- src/server/http.test.ts @@ -6,11 +6,13 @@
- src/server/http.test.ts @@ -208,3 +210,53 @@
- src/server/http.ts @@ -7,6 +7,7 @@
- src/server/http.ts @@ -43,6 +44,12 @@
- src/server/http.ts @@ -50,18 +57,15 @@
- src/server/http.ts @@ -96,6 +100,38 @@
- src/server/http.ts @@ -180,14 +216,17 @@