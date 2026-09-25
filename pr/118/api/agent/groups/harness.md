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

Review concern 03 of 05: Group count and cross-part dependsOn gates (`harness`)

Part: Gating expects

The why:

The old gates could not express "not too many groups" or "no chain across stories", which the phase 1 outcomes ask for.

The what:

`checks.ts` adds a `groups` range expect and fails any `dependsOn` that points into another part, with the schema in `case.ts`, the report line in `result.ts`, and tests.

Look for:
- The cross-part `dependsOn` check runs on every case, with no expect needed.

Hunk refs for this concern:
- scripts/eval/case.ts
- scripts/eval/checks.ts
- scripts/eval/result.ts
- scripts/eval/checks.test.ts
- scripts/eval/graders.test.ts
- scripts/eval/report.test.ts