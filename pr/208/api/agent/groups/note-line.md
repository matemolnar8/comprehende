Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 2003fd3907eda8f8af07e131e55786e9e5953dc0` and `git rev-parse --verify 6c7a3a5b160597204276d92b5e1e298dda060db7` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 2003fd3907eda8f8af07e131e55786e9e5953dc0 6c7a3a5b160597204276d92b5e1e298dda060db7 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  2003fd3907eda8f8af07e131e55786e9e5953dc0

head               6c7a3a5b160597204276d92b5e1e298dda060db7

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 2003fd3907eda8f8af07e131e55786e9e5953dc0 6c7a3a5b160597204276d92b5e1e298dda060db7

Review concern 02 of 02: Notes pin the doing line (`note-line`)

Part: Note line

The what:

The note rule now asks for the line that does what the note says. The `.agents/skills` copy is the same edit from `pnpm sync:skill`; skip it.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- .agents/skills/comprehende/SKILL.md