Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify da6ebeb0cacab7e988d44fe1b22f2cfda32b7747` and `git rev-parse --verify 7bf8232178589054ec0dcfe2ea5cf4eb85c423eb` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames da6ebeb0cacab7e988d44fe1b22f2cfda32b7747 7bf8232178589054ec0dcfe2ea5cf4eb85c423eb -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  da6ebeb0cacab7e988d44fe1b22f2cfda32b7747

head               7bf8232178589054ec0dcfe2ea5cf4eb85c423eb

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames da6ebeb0cacab7e988d44fe1b22f2cfda32b7747 7bf8232178589054ec0dcfe2ea5cf4eb85c423eb

Review concern 02 of 03: Tests lock the split (`tests`)

Part: Non-fatal lint

The why:

The wiring group needs proof that lint stays visible and does not fail the case.

The what:

Checks, result-line, and HTML report tests assert empty `failures` with a populated `lints` array.

Depends on:
- 01 Lints leave failures (`split`)

Hunk refs for this concern:
- scripts/eval/checks.test.ts @@ -89,7 +89,9 @@
- scripts/eval/checks.test.ts @@ -137,11 +139,41 @@
- scripts/eval/graders.test.ts @@ -30,6 +30,7 @@
- scripts/eval/graders.test.ts @@ -59,6 +60,7 @@
- scripts/eval/graders.test.ts @@ -82,7 +84,8 @@
- scripts/eval/graders.test.ts @@ -105,6 +108,7 @@
- scripts/eval/graders.test.ts @@ -127,6 +131,7 @@
- scripts/eval/report.test.ts @@ -5,6 +5,7 @@
- scripts/eval/report.test.ts @@ -78,6 +79,29 @@