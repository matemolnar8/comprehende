Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 742c7c46b48dec27a765681256e41cd7cab1017f` and `git rev-parse --verify 687e4effbdcb936fa03fb6308c0536623ac1a601` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 742c7c46b48dec27a765681256e41cd7cab1017f 687e4effbdcb936fa03fb6308c0536623ac1a601 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  742c7c46b48dec27a765681256e41cd7cab1017f

head               687e4effbdcb936fa03fb6308c0536623ac1a601

Named refs at pin: 742c7c46b48dec27a765681256e41cd7cab1017f ... 687e4effbdcb936fa03fb6308c0536623ac1a601

Read the diff:

git diff --find-renames 742c7c46b48dec27a765681256e41cd7cab1017f 687e4effbdcb936fa03fb6308c0536623ac1a601

Review concern 03 of 04: Skill rewrite with tie-breaks (`skill-rewrite`)

Part: Batched reading and skill

The what:

The skill puts each rule in one section, reads by `show --batch` in step 3, and adds tie-breaks for groups and parts. The `.agents/skills/comprehende/` files repeat `skills-next/comprehende/`, and the digest marks them the same change, so read the `skills-next` files and skip the copies.

Attention (product):
Step 4 now says a close split or merge call keeps one group, and Grouping drops the old hint that a review of more than five files rarely fits one group. Runs agree more often, but a review can hold fewer, bigger groups. Decide whether bigger groups are an acceptable price for the higher group ARI.

Depends on:
- 01 Read batches and size guess (`batch-plan`)

Hunk refs for this concern:
- .agents/skills/comprehende/SKILL.md
- skills-next/comprehende/SKILL.md
- .agents/skills/comprehende/references/powershell.md
- skills-next/comprehende/references/powershell.md
- .agents/skills/comprehende/references/refresh.md
- skills-next/comprehende/references/refresh.md
- scripts/eval/skill.test.ts