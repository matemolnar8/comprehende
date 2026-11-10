Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 742c7c46b48dec27a765681256e41cd7cab1017f` and `git rev-parse --verify 687e4effbdcb936fa03fb6308c0536623ac1a601` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 742c7c46b48dec27a765681256e41cd7cab1017f 687e4effbdcb936fa03fb6308c0536623ac1a601 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  742c7c46b48dec27a765681256e41cd7cab1017f

head               687e4effbdcb936fa03fb6308c0536623ac1a601

Named refs at pin: 742c7c46b48dec27a765681256e41cd7cab1017f ... 687e4effbdcb936fa03fb6308c0536623ac1a601

Read the diff:

git diff --find-renames 742c7c46b48dec27a765681256e41cd7cab1017f 687e4effbdcb936fa03fb6308c0536623ac1a601

Review concern 01 of 04: Read batches and size guess (`batch-plan`)

Part: Batched reading and skill

The what:

`readingPlan` in `batch.ts` picks the files to read and packs them into batches that `show --batch` prints. `digest` adds a `read:` line and a size guess, and `pregroup` writes that guess as `size`.

Attention (risk):
`skipReason` leaves out lockfiles, images, binaries, +0/-0 renames and copies, moves, generated files, and every mirror but the first. The skill reads a skipped file only when the agent asks with `show --file`. A mirror matches on identical added and removed lines, so a copy with the same lines at another place is not read. Decide whether this skip list is safe for any reviewed repo.

Questions:
- Why are the `guessSize` floors 20, 200, 550, and 2,000 changed lines?

Hunk refs for this concern:
- src/review/batch.ts
- src/review/batch.test.ts
- src/review/size.ts
- src/review/size.test.ts
- src/review/digest.ts@272+271
- src/review/digest.ts@350+350
- src/cli/commands.ts
- src/cli/commands.test.ts
- src/cli/args.ts
- src/cli/args.test.ts
- src/cli/main.ts
- README.md