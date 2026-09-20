Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 69d6415a9f77e02741ff146bdee744ff7648204e` and `git rev-parse --verify d05d71698063919c5928f161ed03e5c749f26594` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 69d6415a9f77e02741ff146bdee744ff7648204e d05d71698063919c5928f161ed03e5c749f26594 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  69d6415a9f77e02741ff146bdee744ff7648204e

head               d05d71698063919c5928f161ed03e5c749f26594

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 69d6415a9f77e02741ff146bdee744ff7648204e d05d71698063919c5928f161ed03e5c749f26594

Review concern 02 of 03: Skip graders on the smoke path (`no-graders`)

The why:

[#87](source:s1) makes PR smoke producer, validate, and expects. Graders stay on the full suite.

The what:

`--no-graders` skips packet, graders, and site export. Case lines omit grouping and prose counts. The HTML report says graders off.

Look for:
- For `--no-graders`, `evalOneCase` still runs `cmdValidate` and `runDeterministicChecks` before it returns.

Hunk refs for this concern:
- scripts/eval/args.test.ts @@ -1,6 +1,6 @@
- scripts/eval/args.test.ts @@ -14,6 +14,7 @@
- scripts/eval/args.test.ts @@ -26,6 +27,17 @@
- scripts/eval/args.test.ts @@ -33,6 +45,10 @@
- scripts/eval/args.ts @@ -2,7 +2,7 @@
- scripts/eval/args.ts @@ -11,10 +11,11 @@
- scripts/eval/args.ts @@ -38,6 +39,7 @@
- scripts/eval/args.ts @@ -59,6 +61,7 @@
- scripts/eval/args.ts @@ -72,6 +75,10 @@
- scripts/eval/args.ts @@ -93,7 +100,7 @@
- scripts/eval/graders.test.ts @@ -51,6 +51,30 @@
- scripts/eval/report.test.ts @@ -32,6 +32,7 @@
- scripts/eval/report.test.ts @@ -77,6 +78,19 @@
- scripts/eval/report.ts @@ -97,7 +97,9 @@
- scripts/eval/result.ts @@ -27,6 +27,7 @@
- scripts/eval/result.ts @@ -63,8 +64,12 @@
- scripts/eval/run.ts @@ -64,6 +64,7 @@
- scripts/eval/run.ts @@ -75,6 +76,7 @@
- scripts/eval/run.ts @@ -101,6 +103,7 @@
- scripts/eval/run.ts @@ -179,7 +182,7 @@