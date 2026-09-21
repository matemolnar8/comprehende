Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify da6ebeb0cacab7e988d44fe1b22f2cfda32b7747` and `git rev-parse --verify f946e0a84958f6078394b553747632125fb0695e` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames da6ebeb0cacab7e988d44fe1b22f2cfda32b7747 f946e0a84958f6078394b553747632125fb0695e -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  da6ebeb0cacab7e988d44fe1b22f2cfda32b7747

head               f946e0a84958f6078394b553747632125fb0695e

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames da6ebeb0cacab7e988d44fe1b22f2cfda32b7747 f946e0a84958f6078394b553747632125fb0695e

Review concern 01 of 03: Lints leave failures (`split`)

Part: Non-fatal lint

The why:

[This session](source:s1) says `checks.ts` still pushed `proseLint` into `failures[]`.

The what:

`runDeterministicChecks` returns `lints`. `caseFailed` and the HTML report read that field.

Look for:
- When `proseLints` finds one long lookFor sentence, `failures` stays empty and `lints` holds that sentence.
- A case with only `lints` prints `lint N` and `caseFailed` is false.

Hunk refs for this concern:
- scripts/eval/checks.ts @@ -12,6 +12,7 @@
- scripts/eval/checks.ts @@ -121,12 +122,9 @@
- scripts/eval/result.ts @@ -35,11 +35,7 @@
- scripts/eval/result.ts @@ -60,9 +56,8 @@
- scripts/eval/report.ts @@ -152,6 +152,10 @@