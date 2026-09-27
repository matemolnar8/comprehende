Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 5d2170929f446358d977771fbb7604e64fc40d2d` and `git rev-parse --verify 4a199f24c215f4e619d8dd75adb6dbd6abcfc603` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 5d2170929f446358d977771fbb7604e64fc40d2d 4a199f24c215f4e619d8dd75adb6dbd6abcfc603 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  5d2170929f446358d977771fbb7604e64fc40d2d

head               4a199f24c215f4e619d8dd75adb6dbd6abcfc603

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 5d2170929f446358d977771fbb7604e64fc40d2d 4a199f24c215f4e619d8dd75adb6dbd6abcfc603

Review concern 01 of 01: Muse install gate (`muse-install-gate`)

The why:

The workflow fails to load when the Muse install step checks a secret in its if. [That run finished with no jobs.](source:s1)

The what:

The install step maps the Muse key into env and skips itself when that value is empty.

Hunk refs for this concern:
- .github/workflows/eval.yml