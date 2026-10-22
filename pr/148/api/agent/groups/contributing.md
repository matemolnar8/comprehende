Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 64c573619923b163e1bb2313bab69384ff71083e` and `git rev-parse --verify 2d9a15698520f1b0a1bf05f254910dd7c5249250` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 64c573619923b163e1bb2313bab69384ff71083e 2d9a15698520f1b0a1bf05f254910dd7c5249250 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  64c573619923b163e1bb2313bab69384ff71083e

head               2d9a15698520f1b0a1bf05f254910dd7c5249250

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 64c573619923b163e1bb2313bab69384ff71083e 2d9a15698520f1b0a1bf05f254910dd7c5249250

Review concern 02 of 03: Developer notes in CONTRIBUTING.md (`contributing`)

The why:

The developer notes removed from the README need a home in the repo.

The what:

Develop, Serve and export, Refresh, Release, and Fixture sections. The content matches the old README sections, with refresh rules as a list and Pages setup as one path.

Depends on:
- 01 User-facing README (`readme`)

Hunk refs for this concern:
- CONTRIBUTING.md