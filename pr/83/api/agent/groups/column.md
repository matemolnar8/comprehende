Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82` and `git rev-parse --verify c77e82775e65bb5e490a77688e8ffd272829c18f` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82 c77e82775e65bb5e490a77688e8ffd272829c18f -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82

head               c77e82775e65bb5e490a77688e8ffd272829c18f

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82 c77e82775e65bb5e490a77688e8ffd272829c18f

Review concern 07 of 08: Overview part header summary (`column`)

Part: Overview

The why:

[The request](source:s1) puts the one-sentence what under the colored Overview column title only.

The what:

`PartColumn` looks up `document.parts` by name and renders the summary under the uppercase title, clamped to two lines.

Look for:
- The part summary sits in the Overview column header, muted, `line-clamp-2`, and the Sidebar part header is still name-only.

Hunk refs for this concern:
- src/ui/components/Overview.tsx @@ -4,7 +4,7 @@
- src/ui/components/Overview.tsx @@ -62,6 +62,7 @@
- src/ui/components/Overview.tsx @@ -76,12 +77,14 @@
- src/ui/components/Overview.tsx @@ -89,15 +92,22 @@
- src/ui/lib/parts.ts @@ -13,6 +13,16 @@