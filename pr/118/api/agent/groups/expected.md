Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157` and `git rev-parse --verify 3bd6567d9534b1e5573a2bb24d8417b2d2770049` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 3bd6567d9534b1e5573a2bb24d8417b2d2770049 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157

head               3bd6567d9534b1e5573a2bb24d8417b2d2770049

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 3bd6567d9534b1e5573a2bb24d8417b2d2770049

Review concern 01 of 05: Written expected outcome per case (`expected`)

The why:

[#117](source:s1) phase 1: a human-written expected review for each case.

The what:

`eval/review-criteria.md` holds the shared criteria and template. Each case adds `expected.md` with story, groups, must-state claims, and baseline.

Hunk refs for this concern:
- eval/review-criteria.md
- eval/cases/cigster-118/expected.md
- eval/cases/cigster-84/expected.md
- eval/cases/cigster-99/expected.md
- eval/cases/comprehende-39/expected.md
- eval/cases/comprehende-47/expected.md
- eval/cases/comprehende-50/expected.md
- eval/cases/comprehende-57/expected.md
- eval/cases/comprehende-59/expected.md
- eval/cases/comprehende-67/expected.md
- eval/cases/vitadeck-24/expected.md