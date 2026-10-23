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

Review concern 04 of 07: Refresh keeps a directory ref (`refresh`)

Part: Directory refs

The why:

A refreshed review must carry a directory ref over to new commits without losing the files that appeared under it.

The what:

`refreshDocument` in `refresh.ts` keeps a directory ref whose directory still has live hunks, reports the changed and reformatted hunks under it, and leaves new files under it to the `update` group.

Look for:
- Subtle: a directory ref collects `changed` and `reformat` hunks of the files it covers but not `newHunks`; a file added under that directory at the new head lands in the draft `update` group, where a path ref would have kept it.

Depends on:
- 02 Coverage: the most specific ref wins (`coverage`)

Hunk refs for this concern:
- src/review/refresh.ts
- src/review/refresh.test.ts