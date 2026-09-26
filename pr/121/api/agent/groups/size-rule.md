Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 828059462124f776a8c04caf44e08f150f14bf76` and `git rev-parse --verify 5d029c38c740e96de87bfffcade76effe1b3a55f` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 828059462124f776a8c04caf44e08f150f14bf76 5d029c38c740e96de87bfffcade76effe1b3a55f -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  828059462124f776a8c04caf44e08f150f14bf76

head               5d029c38c740e96de87bfffcade76effe1b3a55f

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 828059462124f776a8c04caf44e08f150f14bf76 5d029c38c740e96de87bfffcade76effe1b3a55f

Review concern 01 of 01: Size rule for a cross-layer contract (`size-rule`)

The why:

[The producer](source:s1) treated four groups as medium. The same change with six groups was large.

The what:

`skills-next` says that contract is large, and the `.agents` copy is identical.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- .agents/skills/comprehende/SKILL.md