Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify df677575fda82ed86e32754f10d70d9f5992cf23` and `git rev-parse --verify e7578d9f0cfb1119b603c616c364d2bb1e2436ac` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames df677575fda82ed86e32754f10d70d9f5992cf23 e7578d9f0cfb1119b603c616c364d2bb1e2436ac -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  df677575fda82ed86e32754f10d70d9f5992cf23

head               e7578d9f0cfb1119b603c616c364d2bb1e2436ac

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames df677575fda82ed86e32754f10d70d9f5992cf23 e7578d9f0cfb1119b603c616c364d2bb1e2436ac

Review concern 02 of 03: The digest classes a flagged file generated (`digest`)

Part: generated marker

The why:

The flag has to reach the draft `mechanical` group, which the digest kind decides ([PR #153](source:s1)).

The what:

`classifyKind` in `digest.ts` returns `generated` for a flagged file right after the rename and copy checks, so the flag wins over the test and docs path classes.

Look for:
- A generated `.md` or a file under `tests/` with a marker now lands in the draft `mechanical` group; before, its path class won.

Depends on:
- 01 readDiff flags generated files (`marker`)

Hunk refs for this concern:
- src/review/digest.ts
- src/review/digest.test.ts