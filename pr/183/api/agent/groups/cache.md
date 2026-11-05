Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 4ead77f938f8995fbae6e81f80833d04bac338ed` and `git rev-parse --verify 60446b8a8bd67320a7961211586485443a1c4239` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 4ead77f938f8995fbae6e81f80833d04bac338ed 60446b8a8bd67320a7961211586485443a1c4239 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  4ead77f938f8995fbae6e81f80833d04bac338ed

head               60446b8a8bd67320a7961211586485443a1c4239

Named refs at pin: 4ead77f938f8995fbae6e81f80833d04bac338ed ... HEAD

Read the diff:

git diff --find-renames 4ead77f938f8995fbae6e81f80833d04bac338ed 60446b8a8bd67320a7961211586485443a1c4239

Review concern 02 of 04: Shared clone cache and worktree .env (`cache`)

The why:

Delegate worktrees symlinked `.env` by hand, and the clone cache under `eval/.cache` was per checkout and raced on first use [in parallel runs](source:s1).

The what:

`checkout.ts` finds the git common dir; `loadDotEnv` reads the worktree `.env` and then the main checkout's, and `cloneCaseFromCache` fills the shared cache under a lock before it hardlink-clones a private bare repo for the case.

Attention (tradeoff):
`withLock` holds the cache entry through the first clone, the fetch, and the hardlink clone. Parallel cases of one repo queue there, so a cold ruff clone blocks every other ruff case until it ends. A lock whose owner pid is dead, or that has no pid after 60 seconds, is taken over.

Hunk refs for this concern:
- scripts/eval/checkout.ts
- scripts/eval/env.ts
- scripts/eval/env.test.ts
- scripts/eval/clone.ts
- scripts/eval/clone.test.ts
- scripts/eval/add-case.ts