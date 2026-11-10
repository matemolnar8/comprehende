Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a6854906c4b4b901e5047622203c2e9b45854959` and `git rev-parse --verify f00f1c4c67f2bf2c9b9e42474809f7c9eb3e28dd` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a6854906c4b4b901e5047622203c2e9b45854959 f00f1c4c67f2bf2c9b9e42474809f7c9eb3e28dd -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  a6854906c4b4b901e5047622203c2e9b45854959

head               f00f1c4c67f2bf2c9b9e42474809f7c9eb3e28dd

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a6854906c4b4b901e5047622203c2e9b45854959 f00f1c4c67f2bf2c9b9e42474809f7c9eb3e28dd

Review concern 01 of 03: Part-level expects (`checks`)

The what:

`case.ts` accepts `partsTogether` and `partsApart`, and `runDeterministicChecks` in `checks.ts` scores them like `together` and `apart`, but per part. A group with no `part` counts as one unnamed story, so a one-story review fails every `partsApart` pair.

Attention (contract):
`unheldPaths` fails a part expect when no group holds one of its paths, while group-level `apart` passes in that case. A pair on a lockfile such as `pnpm-lock.yaml`, which sits in no group, therefore fails every run instead of passing for free. Decide whether a case author should get that failure or a silent pass.

Hunk refs for this concern:
- scripts/eval/case.ts
- scripts/eval/checks.ts
- scripts/eval/checks.test.ts
- scripts/eval/result.ts
- scripts/eval/graders.test.ts
- scripts/eval/report.test.ts