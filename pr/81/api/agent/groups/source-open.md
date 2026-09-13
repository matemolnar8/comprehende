Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 371b8bda48b97150464e654926c3e84ca29bfdad` and `git rev-parse --verify c14a89b5503d1688c9ba6902e74ff4abb6bafd51` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 371b8bda48b97150464e654926c3e84ca29bfdad c14a89b5503d1688c9ba6902e74ff4abb6bafd51 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  371b8bda48b97150464e654926c3e84ca29bfdad

head               c14a89b5503d1688c9ba6902e74ff4abb6bafd51

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 371b8bda48b97150464e654926c3e84ca29bfdad c14a89b5503d1688c9ba6902e74ff4abb6bafd51

Review concern 01 of 01: Prefer the current group (`source-open`)

The why:

[The request](source:s1) needs the open target to keep the reader on the group they are already reading.

The what:

`openTargetForSource` ranks pin, current group lookFor, `groupSourceIds` membership, any group lookFor, named sources, then document lookFor. `App.openSource` passes the current group id.

Look for:
- [The request](source:s1) says opening this source from the group's Sources list stays on the group and focuses this claim.

Hunk refs for this concern:
- src/ui/App.tsx @@ -333,7 +333,8 @@
- src/ui/App.tsx @@ -343,7 +344,7 @@
- src/ui/lib/look-for.test.ts @@ -230,6 +230,17 @@
- src/ui/lib/look-for.test.ts @@ -237,10 +248,41 @@
- src/ui/lib/look-for.ts @@ -1,5 +1,5 @@
- src/ui/lib/look-for.ts @@ -140,6 +140,7 @@
- src/ui/lib/look-for.ts @@ -147,13 +148,30 @@