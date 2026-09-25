Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157` and `git rev-parse --verify 41adb309df1d25389e80787bfcd834719986a4a8` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 41adb309df1d25389e80787bfcd834719986a4a8 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157

head               41adb309df1d25389e80787bfcd834719986a4a8

Named refs at pin: a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 ... 41adb309df1d25389e80787bfcd834719986a4a8

Read the diff:

git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 41adb309df1d25389e80787bfcd834719986a4a8

Review concern 05 of 05: Skill: sources against head, grouping by concern (`skill`)

Part: Skill

The why:

The baseline runs missed ticket deviations, repeated stale PR claims, split one concern into many groups, and chained stories with `dependsOn`.

The what:

`skills-next/comprehende/SKILL.md` gives every source item a verdict from head, takes the why from a stated problem or goal, keeps tests and call sites with their code, and adds `lookFor` cases. The `.agents/` files are identical synced copies.

Look for:
- Steps 4 and 5 now end on completion criteria that name the new source-check and grouping rules.
- The graders read their rubric from these sections, so grader findings before and after this change are not strictly comparable.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- skills-next/comprehende/references/example.md
- .agents/skills/comprehende/SKILL.md
- .agents/skills/comprehende/references/example.md