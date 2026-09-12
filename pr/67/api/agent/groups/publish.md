Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify c7978bdc875cecaa6e396c724e48bac751b1e10b` and `git rev-parse --verify 16565def6a52a638a09689dc5f6ddfe45cab1504` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames c7978bdc875cecaa6e396c724e48bac751b1e10b 16565def6a52a638a09689dc5f6ddfe45cab1504 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  c7978bdc875cecaa6e396c724e48bac751b1e10b

head               16565def6a52a638a09689dc5f6ddfe45cab1504

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames c7978bdc875cecaa6e396c724e48bac751b1e10b 16565def6a52a638a09689dc5f6ddfe45cab1504

Review concern 01 of 05: pages-review publish and prune (`publish`)

Part: GitHub Pages reviews

The why:

Later groups call this script. [The session](source:s1) asked for GitHub Pages, not a new host.

The what:

`scripts/pages-review.ts` copies an export to `pr/<n>/` on `gh-pages`, writes `.nojekyll` and an index, and deletes folders by PR number or `published.json` age.

Look for:
- Two publishes at once rebase and retry five times. A sixth conflict still fails the push.
- A missing `published.json` is treated as 1970-01-01, so TTL prune deletes that folder.

Hunk refs for this concern:
- scripts/pages-review.ts @@ -0,0 +1,462 @@