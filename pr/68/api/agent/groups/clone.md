Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 61f79cce8191e348bcd1d72ade335b4c47c18ad9` and `git rev-parse --verify 603bbf138873e1fab673ef73d0a8238cc225190a` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 61f79cce8191e348bcd1d72ade335b4c47c18ad9 603bbf138873e1fab673ef73d0a8238cc225190a -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  61f79cce8191e348bcd1d72ade335b4c47c18ad9

head               603bbf138873e1fab673ef73d0a8238cc225190a

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 61f79cce8191e348bcd1d72ade335b4c47c18ad9 603bbf138873e1fab673ef73d0a8238cc225190a

Review concern 02 of 08: Pin a PR into a worktree (`clone`)

Part: Report grader

The why:

The producer reviews a frozen head, not today's branch. `pnpm eval:add` writes that pin.

The what:

`add-case` fetches PR JSON with `gh` and records base and head SHAs. `clone.ts` fills a bare cache and adds a detached worktree at head.

Look for:
- For this repo, `thisRepoMirror` clones the local checkout and adds a `github` remote for pull refs.

Depends on:
- 01 Case schema and flags (`schema`)

Hunk refs for this concern:
- scripts/eval/github.ts @@ -0,0 +1,125 @@
- scripts/eval/clone.ts @@ -0,0 +1,88 @@
- scripts/eval/add-case.ts @@ -0,0 +1,215 @@