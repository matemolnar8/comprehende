Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify d796524f8e3f483ab92925f55f17835b7301a18f` and `git rev-parse --verify f3d996d09cbba208f3f138e7dbf71ed86a0bca0d` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames d796524f8e3f483ab92925f55f17835b7301a18f f3d996d09cbba208f3f138e7dbf71ed86a0bca0d -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  d796524f8e3f483ab92925f55f17835b7301a18f

head               f3d996d09cbba208f3f138e7dbf71ed86a0bca0d

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames d796524f8e3f483ab92925f55f17835b7301a18f f3d996d09cbba208f3f138e7dbf71ed86a0bca0d

Review concern 03 of 03: Inline packet, keep grader tools (`grader-packet`)

The why:

[#97](source:s1) puts grader tokens at 79% because the packet sits on disk and graders walk the tree to find it. The [session](source:s3) keeps tools and drops a step cap.

The what:

`groupingPrompt` and `prosePrompt` embed the packet. `GRADER_PACKET_INTRO` tells the grader to start there and read only the files a check needs. `runGrader` still passes `GRADER_TOOLS`.

Look for:
- Nothing in the harness caps grader steps. The four tools stay; only the prompt says do not wander.

Depends on:
- 01 Per-call tool records (`tool-records`)

Hunk refs for this concern:
- scripts/eval/graders.ts @@ -22,6 +22,13 @@
- scripts/eval/graders.ts @@ -46,7 +53,7 @@
- scripts/eval/graders.ts @@ -54,17 +61,19 @@
- scripts/eval/graders.ts @@ -88,11 +97,13 @@
- scripts/eval/graders.ts @@ -112,7 +123,7 @@
- scripts/eval/graders.ts @@ -123,7 +134,7 @@
- scripts/eval/graders.test.ts @@ -1,7 +1,39 @@
- scripts/eval/graders.test.ts @@ -50,6 +82,50 @@
- scripts/eval/run.ts @@ -186,14 +189,14 @@
- scripts/eval/run.ts @@ -202,7 +205,7 @@