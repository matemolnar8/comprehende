Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 9dd4b3ba64302a70f316f69651f42604cab649a4` and `git rev-parse --verify 96752e929acd94c298995370a505caffbf40f32b` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 9dd4b3ba64302a70f316f69651f42604cab649a4 96752e929acd94c298995370a505caffbf40f32b -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  9dd4b3ba64302a70f316f69651f42604cab649a4

head               96752e929acd94c298995370a505caffbf40f32b

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 9dd4b3ba64302a70f316f69651f42604cab649a4 96752e929acd94c298995370a505caffbf40f32b

Review concern 01 of 01: Survive transient agent failures in the eval harness (`harness-resilience`)

The why:

Issue #123 asks for a suite that survives a failed agent run instead of dying partway [text](source:s1). This group carries the still-relevant fixes to the Muse-only harness.

The what:

The producer retries once when the agent run fails without writing a review, and graders get a shorter timeout with retries only on non-JSON text. Failures print early and docs record the behavior.

Hunk refs for this concern:
- scripts/eval/run.ts
- scripts/eval/graders.ts
- scripts/eval/constants.ts
- scripts/eval/result.ts
- scripts/eval/graders.test.ts
- docs/eval.md