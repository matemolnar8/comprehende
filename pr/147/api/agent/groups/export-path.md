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

Review concern 03 of 07: export opens the review from its path (`export-path`)

Part: What changed

The why:

`export` loaded the document itself and passed it in, so `openReview` could not find the `previous` file and the exported site had no `changes`.

The what:

`exportStaticSite` drops its `ctx` option, always opens the review from `dataPath`, and returns the context it used; the CLI, the eval runner, and the tests take it from the result, and a refresh test runs export and the `jq .document` round trip end to end.

Look for:
- `export` now prints the drift and coverage warnings after it writes the site, with the note `exported anyway`.
- The two edits in `image.test.ts` and `lockfile.test.ts` are identical.

Depends on:
- 02 The changes payload (`changes-payload`)

Hunk refs for this concern:
- src/api/snapshot.ts@19+19
- src/api/snapshot.ts@39+39
- src/api/snapshot.ts@67+67
- src/cli/main.ts@15+15
- src/cli/main.ts@65+65
- src/cli/main.ts@82+81
- scripts/eval/run.ts
- src/api/export.test.ts@47+48
- src/api/image.test.ts@9+9
- src/api/image.test.ts@107+107
- src/api/lockfile.test.ts@8+8
- src/api/lockfile.test.ts@108+108
- src/review/refresh.test.ts@1+1
- src/review/refresh.test.ts@297+300