Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 0856bd3aab23ba57f237ebb4f2d727b65e0655af` and `git rev-parse --verify d6a529bc7809dc9302df686259e8bb39003cd422` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 0856bd3aab23ba57f237ebb4f2d727b65e0655af d6a529bc7809dc9302df686259e8bb39003cd422 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  0856bd3aab23ba57f237ebb4f2d727b65e0655af

head               d6a529bc7809dc9302df686259e8bb39003cd422

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 0856bd3aab23ba57f237ebb4f2d727b65e0655af d6a529bc7809dc9302df686259e8bb39003cd422

Review concern 01 of 02: Skill workflow (`workflow`)

The why:

[#108](source:s1) names two extra round trips: a read of example.md, and a shell that only verifies refs.

The what:

SKILL.md names the field shape and batches git rev-parse --verify with review, log, and stat.

Look for:
- Subtle. npm view uses || true, so a failed version query still reaches review. A missing ref stops earlier, because both rev-parse lines use &&.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- skills-next/comprehende/references/example.md
- .agents/skills/comprehende/SKILL.md
- .agents/skills/comprehende/references/example.md