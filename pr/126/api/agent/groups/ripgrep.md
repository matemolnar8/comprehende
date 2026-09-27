Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 27f174fed5f90101139e7e11a6f25cadcf032d99` and `git rev-parse --verify fc810024da4c98cba58061aafa6fa182a580aef2` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 27f174fed5f90101139e7e11a6f25cadcf032d99 fc810024da4c98cba58061aafa6fa182a580aef2 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  27f174fed5f90101139e7e11a6f25cadcf032d99

head               fc810024da4c98cba58061aafa6fa182a580aef2

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 27f174fed5f90101139e7e11a6f25cadcf032d99 fc810024da4c98cba58061aafa6fa182a580aef2

Review concern 01 of 01: Bundled ripgrep at SDK startup (`ripgrep`)

The why:

[The request](source:s1) asks to configure ripgrep before the Cursor SDK starts local search.

The what:

runLocalAgent sets CURSOR_RIPGREP_PATH to the platform package rg, and the unit test checks that binary.

Hunk refs for this concern:
- scripts/eval/agent.ts
- scripts/eval/agent.test.ts