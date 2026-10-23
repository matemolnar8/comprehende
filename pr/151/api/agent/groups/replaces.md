Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify f8c3ec7e32977154f65bca52b8d4b71cf8c2f179` and `git rev-parse --verify 874400fb8405fdc380f0c9911983ca94756f9214` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames f8c3ec7e32977154f65bca52b8d4b71cf8c2f179 874400fb8405fdc380f0c9911983ca94756f9214 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  f8c3ec7e32977154f65bca52b8d4b71cf8c2f179

head               874400fb8405fdc380f0c9911983ca94756f9214

Named refs at pin: f8c3ec7 ... 874400f

Read the diff:

git diff --find-renames f8c3ec7e32977154f65bca52b8d4b71cf8c2f179 874400fb8405fdc380f0c9911983ca94756f9214

Review concern 01 of 02: A replaced file and its replacement are not mechanical (`replaces`)

Part: Replaces hint

The why:

[Three regenerated goldens printed as added, generated, inside a collapsed snapshot directory, so no run pulled them out of the mechanical group](source:s2); [the deleted originals had to follow](source:s4).

The what:

`markReplaces` in `digest.ts` pairs an added file with the one deleted file of the same basename when git found no rename, `isMechanicalFile` says neither side is mechanical, so `pregroup` in `commands.ts` lists both in the change group, `mechanicalDirs` leaves them out of the directory collapse, and `dirRefErrors` in `coverage.ts` fails a directory ref that still holds one.

Look for:
- Subtle: a pair needs exactly one added and exactly one deleted file with that basename; two added `index.ts` files, or two deleted ones, leave every file unmarked, and those files count as mechanical and collapse as before.
- The digest line for the pair reads `replaces <old>, not a move` and `replaced by <new>, not a move`; with the pair out of `listed`, a snapshot folder of pure renames still collapses to one `dir/` line.

Hunk refs for this concern:
- src/review/digest.ts
- src/review/digest.test.ts
- src/cli/commands.ts
- src/review/coverage.ts
- src/review/coverage.test.ts