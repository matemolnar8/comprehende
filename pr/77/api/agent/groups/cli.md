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

Review concern 03 of 06: compare command (`cli`)

Part: Compare reviews

The why:

Users run this as `compare --from` and `--to`.

The what:

The CLI loads two review files, skips the work-tree check, and prints text, JSON, or opens the UI.

Look for:
- `compare --json` and `--open` together fail. `compare` skips `assertWorkTree`.

Depends on:
- 01 Review comparison (`engine`)
- 02 Text report (`report`)

Hunk refs for this concern:
- src/cli/args.test.ts @@ -1,5 +1,9 @@
- src/cli/args.test.ts @@ -15,8 +19,11 @@
- src/cli/args.test.ts @@ -30,8 +37,29 @@
- src/cli/args.test.ts @@ -59,6 +87,7 @@
- src/cli/args.test.ts @@ -66,6 +95,46 @@
- src/cli/args.test.ts @@ -77,3 +146,39 @@
- src/cli/args.ts @@ -1,4 +1,4 @@
- src/cli/args.ts @@ -12,11 +12,14 @@
- src/cli/args.ts @@ -30,6 +33,7 @@
- src/cli/args.ts @@ -45,13 +49,20 @@
- src/cli/args.ts @@ -90,8 +101,11 @@
- src/cli/commands.ts @@ -1,5 +1,6 @@
- src/cli/commands.ts @@ -28,3 +29,9 @@
- src/cli/main.ts @@ -5,16 +5,17 @@
- src/cli/main.ts @@ -29,7 +30,9 @@
- src/cli/main.ts @@ -69,6 +72,28 @@