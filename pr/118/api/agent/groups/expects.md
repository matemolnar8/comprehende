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

Review concern 04 of 05: Tighter case.json expects (`expects`)

Part: Gating expects

The why:

[#117](source:s1) phase 2 starts by folding the outcomes into the expects.

The what:

Each `case.json` gets `parts` and `groups` ranges, `together` pairs that keep tests with their code, fuller `mechanicalPaths`, and the must-state claims.

Depends on:
- 03 Group count and cross-part dependsOn gates (`harness`)

Hunk refs for this concern:
- eval/cases/cigster-84/case.json
- eval/cases/cigster-99/case.json
- eval/cases/cigster-118/case.json
- eval/cases/comprehende-39/case.json
- eval/cases/comprehende-47/case.json
- eval/cases/comprehende-50/case.json
- eval/cases/comprehende-57/case.json
- eval/cases/comprehende-59/case.json
- eval/cases/comprehende-67/case.json
- eval/cases/vitadeck-24/case.json