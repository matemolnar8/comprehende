Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 5d2170929f446358d977771fbb7604e64fc40d2d` and `git rev-parse --verify 4a199f24c215f4e619d8dd75adb6dbd6abcfc603` in this repository.
   Done when both objects exist.

2. Choose the relevant review concerns.
   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.
   Done when every concern the question touches has its markdown loaded.

3. Answer from live git.
   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.
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

Commits:
- 4a199f2 Fix Eval suite workflow load by checking the Muse key via env

Sources:
- transcript Cursor session · Sep 27 Eval suite fails on main with zero jobs after a step if checks secrets.MUSE_CODE_API_KEY.

The title:

Eval suite loads on main

The why:

Eval suite fails immediately on push to main with zero jobs. [The Muse install step references secrets in its if.](source:s1)

The what (trivial):

The Muse install step reads MUSE_CODE_API_KEY from its env and runs only when that value is non-empty.

## Review concerns

### 01 Muse install gate (`muse-install-gate`)

The install step maps the Muse key into env and skips itself when that value is empty.

[groups/muse-install-gate.md](groups/muse-install-gate.md)