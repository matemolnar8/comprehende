Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 7397a98caabcef2ae34ea2721b6cdf59ebc4bed1` and `git rev-parse --verify 7013656b0c46cb764980c91fea0358e3414ab683` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 7397a98caabcef2ae34ea2721b6cdf59ebc4bed1 7013656b0c46cb764980c91fea0358e3414ab683 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  7397a98caabcef2ae34ea2721b6cdf59ebc4bed1

head               7013656b0c46cb764980c91fea0358e3414ab683

Named refs at pin: 7397a98c ... origin/t3/modern-web-fixes

Read the diff:

git diff --find-renames 7397a98caabcef2ae34ea2721b6cdf59ebc4bed1 7013656b0c46cb764980c91fea0358e3414ab683

Review concern 04 of 06: Tab title names the view (`tab-title`)

Part: Tab title

The what:

An effect in `App.tsx` sets `document.title` from `pageTitle` in `selection.ts` whenever `meta` or `selection` changes.

Hunk refs for this concern:
- src/ui/App.tsx
- src/ui/lib/selection.ts
- src/ui/lib/selection.test.ts