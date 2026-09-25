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

Review concern 02 of 03: Expected outcome per case (`outcomes`)

Part: Expected outcomes

The why:

[#117](source:s1) asks what a good review of each case looks like, so misses can be told apart from expects that ask too much.

The what:

Each `expected.md` names the groups, the must-state and good-to-state claims, the mistakes to avoid, and what the six baseline runs did.

Look for:
- Every must-state claim was checked against the code at head. The riskiest ones: `server.sh` deleting `.env.local` (cigster-99), what a matching comment pin means (comprehende-47), and the dropped Refresh and coverage on mobile (comprehende-59).
- comprehende-59 leaves the document why as an open question. The PR says what changes, not why.

Depends on:
- 01 Shared review criteria (`criteria`)

Hunk refs for this concern:
- eval/cases/cigster-84/expected.md
- eval/cases/cigster-99/expected.md
- eval/cases/cigster-118/expected.md
- eval/cases/comprehende-39/expected.md
- eval/cases/comprehende-47/expected.md
- eval/cases/comprehende-50/expected.md
- eval/cases/comprehende-57/expected.md
- eval/cases/comprehende-59/expected.md
- eval/cases/comprehende-67/expected.md
- eval/cases/vitadeck-24/expected.md