Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify c257dfe063111589d735393ff0bfdaae47edfca4` and `git rev-parse --verify d5e53209456bcbbd4204c5e753e3c069b0215c5c` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames c257dfe063111589d735393ff0bfdaae47edfca4 d5e53209456bcbbd4204c5e753e3c069b0215c5c -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  c257dfe063111589d735393ff0bfdaae47edfca4

head               d5e53209456bcbbd4204c5e753e3c069b0215c5c

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames c257dfe063111589d735393ff0bfdaae47edfca4 d5e53209456bcbbd4204c5e753e3c069b0215c5c

Review concern 01 of 01: AGENTS.md borrows the T3 shape (`agents-guide`)

The why:

The new sections give agents the same guardrails T3 relies on, so this file stays short and stops common mistakes.

The what:

AGENTS.md gains voice rules, work pipeline, directory map, footguns, done-checklist, verify rules, docs rules, and PR guardrails, all in the T3 shape.

Hunk refs for this concern:
- AGENTS.md