Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 75bdc0bcb271fdf7c988a1004c039068991c56e6` and `git rev-parse --verify 69c1fc567d28c71ac354b6250d2159ce66820a5a` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 75bdc0bcb271fdf7c988a1004c039068991c56e6 69c1fc567d28c71ac354b6250d2159ce66820a5a -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  75bdc0bcb271fdf7c988a1004c039068991c56e6

head               69c1fc567d28c71ac354b6250d2159ce66820a5a

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 75bdc0bcb271fdf7c988a1004c039068991c56e6 69c1fc567d28c71ac354b6250d2159ce66820a5a

Review concern 04 of 04: Skill source copies (`mirrors-1`)

The why:

The source skill and the agent copy in .agents ship the same wording.

The what:

The source and the .agents copy of SKILL.md hold the same edit; read one and skip the other.

Hunk refs for this concern:
- .agents/skills/comprehende/SKILL.md
- skills-next/comprehende/SKILL.md