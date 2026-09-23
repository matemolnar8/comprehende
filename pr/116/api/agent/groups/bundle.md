Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a00142284953190a1c5d269f7805cefc09be2995` and `git rev-parse --verify a610a8c226a46a202300b570b1519382fa6a92cd` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a00142284953190a1c5d269f7805cefc09be2995 a610a8c226a46a202300b570b1519382fa6a92cd -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a00142284953190a1c5d269f7805cefc09be2995

head               a610a8c226a46a202300b570b1519382fa6a92cd

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a00142284953190a1c5d269f7805cefc09be2995 a610a8c226a46a202300b570b1519382fa6a92cd

Review concern 01 of 04: Bundle a case's git history (`bundle`)

Part: Bundled cases

The why:

cigster is private, and CI clears `GH_TOKEN` before the producer runs, so an anonymous clone fails ([request](source:s1)).

The what:

`writeCaseBundle` cuts history at `base` into `repo.bundle`, and `cloneCaseBundle` rebuilds a shallow bare repo from it with `base` as the boundary.

Look for:
- Subtle: a bundle has no shallow list, so `cloneCaseBundle` writes `base` to `shallow` before the fetch. Without that line, the fetch fails its connectivity check on the parents of `base`.
- `writeCaseBundle` refuses a `base` that is not an ancestor of `head`, because the cut at `base` would drop the merge base.

Hunk refs for this concern:
- scripts/eval/clone.ts
- scripts/eval/clone.test.ts