Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 27f174fed5f90101139e7e11a6f25cadcf032d99` and `git rev-parse --verify 31a825ef7d45ac4e658f3047c06d451b03623ad2` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 27f174fed5f90101139e7e11a6f25cadcf032d99 31a825ef7d45ac4e658f3047c06d451b03623ad2 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  27f174fed5f90101139e7e11a6f25cadcf032d99

head               31a825ef7d45ac4e658f3047c06d451b03623ad2

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 27f174fed5f90101139e7e11a6f25cadcf032d99 31a825ef7d45ac4e658f3047c06d451b03623ad2

Review concern 01 of 01: Ripgrep on the eval runner (`ripgrep`)

The why:

[The request](source:s1) asks for apt install of ripgrep in the eval workflow, not a path resolver.

The what:

The workflow runs sudo apt-get install -y ripgrep before the graded eval.

Hunk refs for this concern:
- .github/workflows/eval.yml