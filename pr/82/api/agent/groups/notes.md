Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 93c542dbcdb7bd3989b30739234770d83021fe5a` and `git rev-parse --verify 4167e5fece3f0b0fa6a8a5c21d1381319dc363d5` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 93c542dbcdb7bd3989b30739234770d83021fe5a 4167e5fece3f0b0fa6a8a5c21d1381319dc363d5 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  93c542dbcdb7bd3989b30739234770d83021fe5a

head               4167e5fece3f0b0fa6a8a5c21d1381319dc363d5

Named refs at pin: 93c542dbcdb7bd3989b30739234770d83021fe5a ... 4167e5fece3f0b0fa6a8a5c21d1381319dc363d5

Read the diff:

git diff --find-renames 93c542dbcdb7bd3989b30739234770d83021fe5a 4167e5fece3f0b0fa6a8a5c21d1381319dc363d5

Review concern 03 of 03: Release notes in AGENTS.md (`notes`)

Part: Release notes

The why:

[The request](source:s1) asks that future releases put notes in the commit without being told each time.

The what:

The Releases paragraph in `AGENTS.md` tells the agent to put those notes in the release commit body.

Hunk refs for this concern:
- AGENTS.md @@ -86,7 +86,7 @@