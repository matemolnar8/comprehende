Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157` and `git rev-parse --verify 41adb309df1d25389e80787bfcd834719986a4a8` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 41adb309df1d25389e80787bfcd834719986a4a8 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157

head               41adb309df1d25389e80787bfcd834719986a4a8

Named refs at pin: a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 ... 41adb309df1d25389e80787bfcd834719986a4a8

Read the diff:

git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 41adb309df1d25389e80787bfcd834719986a4a8

Review concern 02 of 05: Expected outcome per case (`outcomes`)

Part: Expected outcomes

The why:

[#117](source:s1) asks what a good review of each case looks like, so misses can be told apart from expects that ask too much.

The what:

Each `expected.md` names the groups, the must-state and good-to-state claims, the mistakes to avoid, and what the six baseline runs did.

Look for:
- comprehende-59 expects no document why because its ticket, #58, is not linked from the PR. vitadeck-24 and comprehende-67 leave the why ungated.

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