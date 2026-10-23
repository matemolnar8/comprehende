Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 279fddef1703cf4e437eb2fdf5e9b16662b1f178` and `git rev-parse --verify efe129d2dea21d8787fee91179c7aad2f3558ded` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 279fddef1703cf4e437eb2fdf5e9b16662b1f178 efe129d2dea21d8787fee91179c7aad2f3558ded -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  279fddef1703cf4e437eb2fdf5e9b16662b1f178

head               efe129d2dea21d8787fee91179c7aad2f3558ded

Named refs at pin: 279fdde ... efe129d

Read the diff:

git diff --find-renames 279fddef1703cf4e437eb2fdf5e9b16662b1f178 efe129d2dea21d8787fee91179c7aad2f3558ded

Review concern 01 of 01: Step 4 states the summary and citation rules (`skill`)

The why:

[Rules that live only in a reference section stop firing once the step list is busy; the lookFor and parts rules needed the same move](source:s2).

The what:

`skills-next/comprehende/SKILL.md` step 4 gains one sentence between the per-group fields and the lookFor pointer, and the `.agents` copy repeats it.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- .agents/skills/comprehende/SKILL.md