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

Review concern 05 of 05: Pages URLs in README (`readme`)

Part: GitHub Pages hosting

The why:

People using the repo need the Pages URL and the one-time enable step.

The what:

README Develop names the `pr/<number>/` and `site/<name>/` URLs, the one-time Pages enable, and the 30-day TTL.

Depends on:
- 01 Pages publish CLI (`cli`)

Hunk refs for this concern:
- README.md @@ -44,6 +44,8 @@