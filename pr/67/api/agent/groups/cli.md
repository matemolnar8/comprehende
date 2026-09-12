Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify c7978bdc875cecaa6e396c724e48bac751b1e10b` and `git rev-parse --verify 62f46c7abf557d7bc177a15e400d8f9861e35bd1` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames c7978bdc875cecaa6e396c724e48bac751b1e10b 62f46c7abf557d7bc177a15e400d8f9861e35bd1 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  c7978bdc875cecaa6e396c724e48bac751b1e10b

head               62f46c7abf557d7bc177a15e400d8f9861e35bd1

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames c7978bdc875cecaa6e396c724e48bac751b1e10b 62f46c7abf557d7bc177a15e400d8f9861e35bd1

Review concern 01 of 05: Pages publish CLI (`cli`)

Part: GitHub Pages hosting

The why:

[PR #67](source:s1) needs a way to copy a static folder onto `gh-pages`. [Bugbot](source:s3) found listing races on that path.

The what:

`publish` and `prune` in `scripts/pages-review.ts` write `pr/<n>/` or `site/<slug>/` and rebuild the listing from `published.json` after a rejected push.

Look for:
- Race. Two publishes rewrite `index.html`. On a rejected push, `applyAndPush` does `reset --hard` to remote `gh-pages` and runs `apply` again.
- For dest `{ kind: "name", name: "demo" }`, the copy lands in `site/demo/` and `prune --pr` leaves it.

Hunk refs for this concern:
- scripts/pages-review.ts @@ -0,0 +1,592 @@