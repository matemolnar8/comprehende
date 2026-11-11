Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 729cfd164d5cef0405a9f2753bc477540cd26ac9` and `git rev-parse --verify db4cb83388fe9468a33f57791ad9237c36dee108` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 729cfd164d5cef0405a9f2753bc477540cd26ac9 db4cb83388fe9468a33f57791ad9237c36dee108 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  729cfd164d5cef0405a9f2753bc477540cd26ac9

head               db4cb83388fe9468a33f57791ad9237c36dee108

Named refs at pin: db4cb833~1 ... db4cb833

Read the diff:

git diff --find-renames 729cfd164d5cef0405a9f2753bc477540cd26ac9 db4cb83388fe9468a33f57791ad9237c36dee108

Review concern 01 of 02: Skill rewrite (`skill`)

The what:

`SKILL.md` gets Ground rules, Grouping, and Fields sections, and the two reference files follow the new step numbers.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- skills-next/comprehende/references/powershell.md
- skills-next/comprehende/references/refresh.md