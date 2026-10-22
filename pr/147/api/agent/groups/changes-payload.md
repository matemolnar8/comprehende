Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 64c573619923b163e1bb2313bab69384ff71083e` and `git rev-parse --verify d86dd9523f70c2245948726ae8a7ea36aaf31b5f` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 64c573619923b163e1bb2313bab69384ff71083e d86dd9523f70c2245948726ae8a7ea36aaf31b5f -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  64c573619923b163e1bb2313bab69384ff71083e

head               d86dd9523f70c2245948726ae8a7ea36aaf31b5f

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 64c573619923b163e1bb2313bab69384ff71083e d86dd9523f70c2245948726ae8a7ea36aaf31b5f

Review concern 02 of 07: The changes payload (`changes-payload`)

Part: What changed

The why:

The UI is fixed and only data changes, so the comparison is computed on the server side and sent with the review ([#72](source:s1)).

The what:

`openReview` loads the `previous` file next to the review path, and `changesPayload` compares prose, lookFor, sources, and group files by group id, with hunk counts from `matchHunks` over the old range.

Look for:
- Groups match by `id`. A group whose id changed shows as one removed and one new group, even when its hunks are the same.
- A missing previous file gives no `changes` at all. A previous file that exists but does not parse makes `openReview` throw, so `serve` and `export` stop.
- When git no longer has the old commits, `codeChanges` returns nothing and the page shows the text changes without hunk counts.

Depends on:
- 01 refresh keeps the previous review (`keep-previous`)

Hunk refs for this concern:
- src/api/changes.ts
- src/api/changes.test.ts
- src/api/types.ts@112+113
- src/api/live.ts@1+1
- src/api/live.ts@5+6
- src/api/live.ts@14+16
- src/api/live.ts@47+53
- src/api/live.ts@64+72
- src/api/live.ts@75+84
- src/api/live.ts@94+108
- src/api/live.ts@245+301