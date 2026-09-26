Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3` and `git rev-parse --verify 9b0fb44297c60c7c1fdc979ce5d3d9d00f7b23ef` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3 9b0fb44297c60c7c1fdc979ce5d3d9d00f7b23ef -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  732a01b08eaa2f79562ea4e2ef76e38c9d92eee3

head               9b0fb44297c60c7c1fdc979ce5d3d9d00f7b23ef

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3 9b0fb44297c60c7c1fdc979ce5d3d9d00f7b23ef

Review concern 01 of 01: Skill lookFor and grouping rules (`skill`)

The why:

The producer reads this file. The new cases have to live here for Grok to follow them.

The what:

`skills-next/comprehende/SKILL.md` adds the lookFor, mechanical, and part rules. `.agents/skills/comprehende/SKILL.md` is an identical copy.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- .agents/skills/comprehende/SKILL.md