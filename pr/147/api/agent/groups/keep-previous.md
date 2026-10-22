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

Review concern 01 of 07: refresh keeps the previous review (`keep-previous`)

Part: What changed

The why:

The comparison needs the old document after `refresh` overwrites `review.json` ([#72](source:s1)).

The what:

`cmdRefresh` copies the old file to `review.<short head sha>.json` beside it and names that file in the new optional `previous` field; the CLI prints where it went.

Look for:
- Each `refresh` that changes the review leaves one more `review.<sha>.json` in the same directory. Nothing deletes the older ones.

Hunk refs for this concern:
- src/schema/review.ts@182+182
- src/cli/commands.ts@1+1
- src/cli/commands.ts@230+230
- src/cli/commands.ts@264+265
- src/cli/main.ts@117+114
- docs/glossary.md