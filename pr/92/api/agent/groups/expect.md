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

Review concern 03 of 03: Three parts on 67 and 47 (`expect`)

Part: Parts expects

The why:

[This session](source:s1) asks to allow the skill-aligned three-part splits the producer already writes.

The what:

`comprehende-67` and `comprehende-47` set `expect.parts.max` to 3.

Hunk refs for this concern:
- eval/cases/comprehende-67/case.json @@ -7,7 +7,7 @@
- eval/cases/comprehende-47/case.json @@ -7,7 +7,7 @@