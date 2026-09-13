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

Review concern 05 of 06: Compare UI (`ui`)

Part: Compare reviews

The why:

[#72](source:s1) wants a clear comparison without a second code-diff view.

The what:

`Root` fetches `compare.json`. On 200 it mounts `CompareApp`, which shows added, removed, and changed groups as interpretation plus hunk pointers.

Look for:
- `fetchCompare` returns null on any non-OK response, so review `serve` still boots when `/api/compare.json` is missing.

Depends on:
- 01 Review comparison (`engine`)
- 04 Compare HTTP server (`server`)

Hunk refs for this concern:
- src/ui/CompareApp.tsx @@ -0,0 +1,126 @@
- src/ui/Root.tsx @@ -0,0 +1,58 @@
- src/ui/api.ts @@ -1,5 +1,6 @@
- src/ui/api.ts @@ -50,6 +51,17 @@
- src/ui/components/CompareNav.tsx @@ -0,0 +1,104 @@
- src/ui/components/CompareStage.tsx @@ -0,0 +1,313 @@
- src/ui/main.tsx @@ -6,8 +6,7 @@
- src/ui/main.tsx @@ -18,9 +17,7 @@