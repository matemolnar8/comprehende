Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 8344a4a460d19d8216fedc94ac71f5c1866aa1a1` and `git rev-parse --verify 975dd4ec32ab0bb3bfd68cc753683e2cefa04430` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 8344a4a460d19d8216fedc94ac71f5c1866aa1a1 975dd4ec32ab0bb3bfd68cc753683e2cefa04430 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  8344a4a460d19d8216fedc94ac71f5c1866aa1a1

head               975dd4ec32ab0bb3bfd68cc753683e2cefa04430

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 8344a4a460d19d8216fedc94ac71f5c1866aa1a1 975dd4ec32ab0bb3bfd68cc753683e2cefa04430

Review concern 01 of 03: Hash is the stored place (`hash`)

Part: Hash route

The why:

[#78](source:s1) wants the URL to name the current place, not sessionStorage.

The what:

`parseHash` and `serializeHash` map the four selection kinds to `#overview`, `#group/<id>`, `#unassigned`, and `#lockfiles`. Group ids are encoded. `selectionFromHash` returns the old default for empty or unknown hashes. `hashWriteMode` skips a no-op, replaces the first write and a dead hash, and pushes a live hop. Tests cover parse, serialize, serve vs Pages URLs, `[` / `]` push, and lookFor owner hops to `#group/login` or `#overview`.

Look for:
- `#group/login` must survive a full page URL, not only `window.location.hash`. [#78](source:s1).
- A lookFor owner hop to login must be a `push`, so Back can leave that group. [#78](source:s1).

Hunk refs for this concern:
- src/ui/lib/selection.ts @@ -2,7 +2,6 @@
- src/ui/lib/selection.ts @@ -23,39 +22,76 @@
- src/ui/lib/selection.ts @@ -75,14 +111,6 @@
- src/ui/lib/selection.test.ts @@ -2,16 +2,18 @@
- src/ui/lib/selection.test.ts @@ -21,30 +23,49 @@
- src/ui/lib/selection.test.ts @@ -72,6 +93,29 @@
- src/ui/lib/selection.test.ts @@ -214,4 +258,15 @@
- src/ui/lib/look-for.test.ts @@ -1,6 +1,7 @@
- src/ui/lib/look-for.test.ts @@ -171,6 +172,19 @@