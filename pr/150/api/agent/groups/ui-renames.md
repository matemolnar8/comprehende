Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8` and `git rev-parse --verify 046cae0b9eba180c36d3e474dd24e1d9aff78852` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8 046cae0b9eba180c36d3e474dd24e1d9aff78852 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8

head               046cae0b9eba180c36d3e474dd24e1d9aff78852

Named refs at pin: 10dbe41 ... 046cae0

Read the diff:

git diff --find-renames 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8 046cae0b9eba180c36d3e474dd24e1d9aff78852

Review concern 05 of 07: Pins on renamed files and the What changed list (`ui-renames`)

Part: Directory refs

The why:

An old-side comment pin names the base path, which no directory ref at head covers; [the review asked that it still find its group](source:s3).

The what:

`groupIdForPinnedSource` in `source.ts` finds a pin's group through `groupsHoldingPath`, after `App.tsx` maps an `old` pin on a renamed file to its head path; the API file entry carries `relocation` so a copy stays out of that map, and `groupPaths` in `changes.ts` lists on the What changed page only the files a directory ref holds under the same rule.

Look for:
- Subtle: only a pin with `side` `old` goes through the rename map, and a copy's old path is not in it; a `new` pin on the old path of a renamed file matches no ref and falls back to the groups that list the source id.

Depends on:
- 02 Coverage: the most specific ref wins (`coverage`)

Hunk refs for this concern:
- src/ui/App.tsx
- src/ui/lib/look-for.ts
- src/ui/lib/look-for.test.ts
- src/schema/source.ts
- src/api/changes.ts
- src/api/changes.test.ts
- src/api/live.ts
- src/api/types.ts