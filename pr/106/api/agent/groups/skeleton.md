Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 6a72e43128d495024364329517b801647812ce40` and `git rev-parse --verify b84519867812a62c793e2a4b9b21a4978b1a5911` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 6a72e43128d495024364329517b801647812ce40 b84519867812a62c793e2a4b9b21a4978b1a5911 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  6a72e43128d495024364329517b801647812ce40

head               b84519867812a62c793e2a4b9b21a4978b1a5911

Named refs at pin: main ... HEAD

Read the diff:

git diff --find-renames 6a72e43128d495024364329517b801647812ce40 b84519867812a62c793e2a4b9b21a4978b1a5911

Review concern 03 of 05: Skeleton writes paths (`skeleton`)

Part: File refs

The why:

The agent reads the skeleton and copies its refs. Those refs are paths, one per file.

The what:

review writes one path per changed file and reports the path count and the hunk count.

Depends on:
- 01 Hunk ref strings (`contract`)

Hunk refs for this concern:
- src/review/skeleton.ts
- src/review/skeleton.test.ts
- src/cli/commands.ts
- src/cli/main.ts
- README.md
- AGENTS.md