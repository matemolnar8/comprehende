Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8` and `git rev-parse --verify a19cd266478558d40de20ddf11a948e8e7263d5d` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8 a19cd266478558d40de20ddf11a948e8e7263d5d -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8

head               a19cd266478558d40de20ddf11a948e8e7263d5d

Named refs at pin: 10dbe41 ... a19cd26

Read the diff:

git diff --find-renames 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8 a19cd266478558d40de20ddf11a948e8e7263d5d

Review concern 05 of 07: Pins on renamed files and the What changed list (`ui-renames`)

Part: Directory refs

The why:

An old-side comment pin names the base path, which no directory ref at head covers; [the review asked that it still find its group](source:s3).

The what:

`App.tsx` builds an old-to-new path map from the file list and passes it through `openTargetForSource` to `groupIdForPinnedSource` in `source.ts`, which maps an `old` pin to the head path before matching refs, and `groupPaths` in `changes.ts` lists the files a directory ref holds on the What changed page.

Look for:
- Subtle: only a pin with `side` `old` goes through the rename map; a `new` pin on the old path of a renamed file matches no ref and falls back to the groups that list the source id.

Depends on:
- 02 Coverage: the most specific ref wins (`coverage`)

Hunk refs for this concern:
- src/ui/App.tsx
- src/ui/lib/look-for.ts
- src/ui/lib/look-for.test.ts
- src/schema/source.ts
- src/api/changes.ts
- src/api/changes.test.ts