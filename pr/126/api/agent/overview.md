Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 27f174fed5f90101139e7e11a6f25cadcf032d99` and `git rev-parse --verify fc810024da4c98cba58061aafa6fa182a580aef2` in this repository.
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

head               fc810024da4c98cba58061aafa6fa182a580aef2

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 27f174fed5f90101139e7e11a6f25cadcf032d99 fc810024da4c98cba58061aafa6fa182a580aef2

Commits:
- fc81002 Point Cursor eval agents at the bundled ripgrep

Sources:
- transcript Cursor session · Sep 27 Remove the Cursor SDK ripgrep error during eval by configuring the rg path at startup.

The title:

Configure ripgrep for Cursor eval agents

The why:

Eval runs print Ripgrep path not configured from the Cursor SDK. [The request](source:s1) asks to set that path at startup.

The what (small):

Cursor eval runs set CURSOR_RIPGREP_PATH to the SDK platform package rg before Agent.create, so ignore scans can start ripgrep.

## Review concerns

### 01 Bundled ripgrep at SDK startup (`ripgrep`)

runLocalAgent sets CURSOR_RIPGREP_PATH to the platform package rg, and the unit test checks that binary.

[groups/ripgrep.md](groups/ripgrep.md)