Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 27f174fed5f90101139e7e11a6f25cadcf032d99` and `git rev-parse --verify 31a825ef7d45ac4e658f3047c06d451b03623ad2` in this repository.
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

base (merge-base)  27f174fed5f90101139e7e11a6f25cadcf032d99

head               31a825ef7d45ac4e658f3047c06d451b03623ad2

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 27f174fed5f90101139e7e11a6f25cadcf032d99 31a825ef7d45ac4e658f3047c06d451b03623ad2

Commits:
- 31a825e Install ripgrep in the eval workflow
- fc81002 Point Cursor eval agents at the bundled ripgrep

Sources:
- transcript Cursor session · Sep 27 Install ripgrep in the eval workflow if the SDK finds rg on PATH, and drop the resolver.

The title:

Install ripgrep for the eval workflow

The why:

The package walk is heavier than this repo wants. [The request](source:s1) asks to install ripgrep in the eval workflow when the SDK finds rg on PATH.

The what (trivial):

The eval workflow installs ripgrep before the graded run so the Cursor SDK can find rg on PATH.

## Review concerns

### 01 Ripgrep on the eval runner (`ripgrep`)

The workflow runs sudo apt-get install -y ripgrep before the graded eval.

[groups/ripgrep.md](groups/ripgrep.md)