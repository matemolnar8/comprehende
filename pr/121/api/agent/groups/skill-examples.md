Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 828059462124f776a8c04caf44e08f150f14bf76` and `git rev-parse --verify e8e77dd12ae08febf6bf96d94a7ad953c901de47` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 828059462124f776a8c04caf44e08f150f14bf76 e8e77dd12ae08febf6bf96d94a7ad953c901de47 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  828059462124f776a8c04caf44e08f150f14bf76

head               e8e77dd12ae08febf6bf96d94a7ad953c901de47

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 828059462124f776a8c04caf44e08f150f14bf76 e8e77dd12ae08febf6bf96d94a7ad953c901de47

Review concern 02 of 02: Skill examples stay general (`skill-examples`)

The why:

[Later edits](source:s1) must not put this repo's layers into a rule that reviews any diff.

The what:

`AGENTS.md` tells skill authors to write rules that fit any repository.

Hunk refs for this concern:
- AGENTS.md