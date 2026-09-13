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

Review concern 02 of 03: App reads and writes the hash (`app`)

Part: Hash route

The why:

The hash helpers do not talk to the window. The app must load from the hash, write on selection change, and apply Back.

The what:

`restoreSelection` now takes `window.location.hash`. A layout effect writes the hash with `history.replaceState` or `history.pushState`. `hashchange` and `popstate` call `selectFromNav`, so Back also clears lookFor highlight. `openLookFor` and `openSource` still call `selectWithMotion`, so lookFor, source, header pager, story Depends on, and `[` / `]` all write the hash.

Look for:
- First paint must not add a history entry. Later hops must. [#78](source:s1).
- Back from a lookFor jump must clear the highlighted claim. The hash apply uses `selectFromNav`. [#78](source:s1).

Depends on:
- 01 Hash is the stored place (`hash`)

Hunk refs for this concern:
- src/ui/App.tsx @@ -14,12 +14,13 @@
- src/ui/App.tsx @@ -50,6 +51,8 @@
- src/ui/App.tsx @@ -63,7 +66,7 @@
- src/ui/App.tsx @@ -79,7 +82,18 @@
- src/ui/App.tsx @@ -152,6 +166,27 @@