Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 30060c417b8961cba2924a994cf9b6a07213c674` and `git rev-parse --verify 4779db00491f81c01848be0c1a452efe167232e8` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 30060c417b8961cba2924a994cf9b6a07213c674 4779db00491f81c01848be0c1a452efe167232e8 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  30060c417b8961cba2924a994cf9b6a07213c674

head               4779db00491f81c01848be0c1a452efe167232e8

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 30060c417b8961cba2924a994cf9b6a07213c674 4779db00491f81c01848be0c1a452efe167232e8

Review concern 02 of 03: Hash is the route in App (`app`)

Part: Hash route

The why:

[#78](source:s1) makes the hash the source of truth. This group is the only place that talks to `window.location`.

The what:

`App` restores from `location.hash` on load, writes with `replaceState` or `pushState`, and listens for `hashchange` and `popstate`.

Look for:
- Opening a live `#group/<id>` skips the write. An empty hash `replaceState`s `#overview`.

Depends on:
- 01 Hash scheme (`hash`)

Hunk refs for this concern:
- src/ui/App.tsx @@ -14,12 +14,13 @@
- src/ui/App.tsx @@ -48,6 +49,8 @@
- src/ui/App.tsx @@ -61,7 +64,7 @@
- src/ui/App.tsx @@ -77,7 +80,18 @@
- src/ui/App.tsx @@ -133,6 +147,27 @@