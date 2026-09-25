Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157` and `git rev-parse --verify 1a3d9a3a44e69e8cd551a4a1484c447c28db5c3f` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 1a3d9a3a44e69e8cd551a4a1484c447c28db5c3f -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157

head               1a3d9a3a44e69e8cd551a4a1484c447c28db5c3f

Named refs at pin: a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 ... 1a3d9a3a44e69e8cd551a4a1484c447c28db5c3f

Read the diff:

git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 1a3d9a3a44e69e8cd551a4a1484c447c28db5c3f

Review concern 01 of 03: Shared review criteria (`criteria`)

Part: Expected outcomes

The why:

Every case is judged the same way, as [#117](source:s1) asks.

The what:

`eval/review-criteria.md` lists the grouping, source-comparison, and lookFor rules, and the section template each `expected.md` follows.

Hunk refs for this concern:
- eval/review-criteria.md