Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 58e78d97ae799b828addec2375c1bce324dc7628` and `git rev-parse --verify 25b251bcd2a97bf6f3ad865e15484368adbcc19f` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 58e78d97ae799b828addec2375c1bce324dc7628 25b251bcd2a97bf6f3ad865e15484368adbcc19f -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: fx2

base (merge-base)  58e78d97ae799b828addec2375c1bce324dc7628

head               25b251bcd2a97bf6f3ad865e15484368adbcc19f

Named refs at pin: main ... change

Read the diff:

git diff --find-renames 58e78d97ae799b828addec2375c1bce324dc7628 25b251bcd2a97bf6f3ad865e15484368adbcc19f

Review concern 01 of 01: Ungrouped (`ungrouped`)

The why:

Fill this group.

The what:

Hunk refs for this concern:
- README.md
- docs/logo.png