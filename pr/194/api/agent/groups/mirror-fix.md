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

Review concern 02 of 04: Mirror pairing after a binary (`mirror-fix`)

Part: Batched reading and skill

The why:

[PR #194](source:s1) says the shift could mark a unique file as a mirror, so `show --batch` would skip it.

The what:

`buildDigest` now pairs each digest with its own file before `markMirrors`, so a skipped binary no longer shifts the pairing. `show --batch`, `pregroup`, `refresh`, and the coverage checks all call `buildDigest`.

Hunk refs for this concern:
- src/review/digest.ts@57+57
- src/review/digest.ts@186+187
- src/review/digest.test.ts