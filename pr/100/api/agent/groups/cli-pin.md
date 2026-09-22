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

Review concern 02 of 03: Producer CLI as a built fact (`cli-pin`)

The why:

[#97](source:s1) saw the producer spend steps proving the CLI path, and once build the reviewed repo's older binary.

The what:

`producerPrompt` takes `cliPath` and names `node <abs>/dist/cli/main.js` as the CLI. `run.ts` passes the resolved path. Tests forbid "local build" and "step 1".

Look for:
- The prompt still says skip the npm version check, from [#99 via PR #100](source:s2), without pinning that skip to step 1.

Depends on:
- 01 Per-call tool records (`tool-records`)

Hunk refs for this concern:
- scripts/eval/producer.ts @@ -7,11 +7,13 @@
- scripts/eval/producer.test.ts @@ -1,18 +1,41 @@
- scripts/eval/run.ts @@ -123,7 +125,7 @@
- scripts/eval/run.ts @@ -149,6 +151,7 @@