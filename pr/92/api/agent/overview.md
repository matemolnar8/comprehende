Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify da6ebeb0cacab7e988d44fe1b22f2cfda32b7747` and `git rev-parse --verify f946e0a84958f6078394b553747632125fb0695e` in this repository.
   Done when both objects exist.

2. Choose the relevant review concerns.
   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.
   Done when every concern the question touches has its markdown loaded.

3. Answer from live git.
   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.
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

Commits:
- f946e0a Drop the parts expect on comprehende-47.
- 7bf8232 Allow three parts on comprehende-47.
- 3330419 Allow three parts on comprehende-67.
- 869f580 Keep prose lint off the eval exit path.

Sources:
- transcript Cursor session · Sep 21 Fix main Eval red after #91: allow three parts on comprehende-67, and keep proseLint reported without failing exit.
- pr PR #92 Widen comprehende-67 parts.max and move prose lint off failures.
  https://github.com/matemolnar8/comprehende/pull/92
- commit 869f580 Report lint N from DeterministicReport.lints. Do not put proseLint in failures.
  https://github.com/matemolnar8/comprehende/commit/869f58048a62fdab48067f8e45fe6ff46917efaf
- commit 3330419 Producer split Pages, hosting, and README. expect.parts.max is 3.
  https://github.com/matemolnar8/comprehende/commit/3330419327abfbea02e46e52df9da5a6bccc8649
- commit 7bf8232 Producer split Sources model, Sources UI, and Skill sync. Part count on this mixed PR is not a stable expect.
  https://github.com/matemolnar8/comprehende/commit/7bf8232178589054ec0dcfe2ea5cf4eb85c423eb
- commit f946e0a Part count on that mixed PR is not stable. Keep apart, size, sourceKinds, mechanicalPaths, and claims.
  https://github.com/matemolnar8/comprehende/commit/f946e0a84958f6078394b553747632125fb0695e

The title:

Keep the full eval green after #91

The why:

After pull request 91, the graded suite failed on `comprehende-67`. [This session](source:s1) asks to allow three parts and keep prose lint off the exit path.

The what (small):

`runDeterministicChecks` puts wording issues on `lints`, and `caseFailed` reads only `failures`. `comprehende-67` allows three parts, and `comprehende-47` no longer scores part count.

Look for:
- [This session](source:s1) asks for a full graded suite with exit 0. No hunk runs `pnpm eval`.

## Review concerns

### 01 Lints leave failures (`split`)

`runDeterministicChecks` returns `lints`. `caseFailed` and the HTML report read that field.

[groups/split.md](groups/split.md)

### 02 Tests lock the split (`tests`)

Checks, result-line, and HTML report tests assert empty `failures` with a populated `lints` array.

Depends on:
- 01 Lints leave failures (`split`)

[groups/tests.md](groups/tests.md)

### 03 Parts expects for 67 and 47 (`expect`)

`comprehende-67` sets `expect.parts.max` to 3, and `comprehende-47` drops `parts` because that mixed PR is not a stable count.

[groups/expect.md](groups/expect.md)