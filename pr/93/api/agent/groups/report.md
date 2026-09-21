Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify da6ebeb0cacab7e988d44fe1b22f2cfda32b7747` and `git rev-parse --verify 555733651e4ad59cf6282901f0cc6697402f85ed` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames da6ebeb0cacab7e988d44fe1b22f2cfda32b7747 555733651e4ad59cf6282901f0cc6697402f85ed -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  da6ebeb0cacab7e988d44fe1b22f2cfda32b7747

head               555733651e4ad59cf6282901f0cc6697402f85ed

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames da6ebeb0cacab7e988d44fe1b22f2cfda32b7747 555733651e4ad59cf6282901f0cc6697402f85ed

Review concern 01 of 01: The report (`report`)

The why:

[The session](source:s1) asked for one document with the findings and the proposals.

The what:

`docs/token-efficiency.md` holds the method, the baseline profile, proposals A to D with measured or estimated savings, the eval harness notes, and the skill variant diff.

Look for:
- Subtle. Section 1 mixes measured values (tokens, steps, file sizes) with one derived value: steps are LLM round trips inferred from tool-call timestamps, not reported by the SDK.
- Proposal A claims `hunkKey` ignores `oldLines` and `newLines`; check `src/schema/identity.ts`.
- Proposal B's per-case saving is an estimate from step counts times average context; sections 2C and 3 hold the only A/B measurements.

Hunk refs for this concern:
- docs/token-efficiency.md @@ -0,0 +1,209 @@