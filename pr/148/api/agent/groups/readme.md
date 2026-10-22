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

Review concern 01 of 03: User-facing README (`readme`)

The why:

This is the text npm users read. It must say what the tool does, how to install it, and how to start a review.

The what:

Short intro, install with the Node.js 24+ and git requirement, a Use section that says to run `/comprehende`, a shorter Why, and a table of CLI commands.

Look for:
- Check each row of the CLI table against the real flags. The `review` row says the base defaults to `origin/HEAD`, then `main` or `master`.

Hunk refs for this concern:
- README.md