Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 2003fd3907eda8f8af07e131e55786e9e5953dc0` and `git rev-parse --verify 6c7a3a5b160597204276d92b5e1e298dda060db7` in this repository.
   Done when both objects exist.

2. Choose the relevant review concerns.
   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.
   Done when every concern the question touches has its markdown loaded.

3. Answer from live git.
   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.
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

Commits:
- 6c7a3a5b Eval: vitadeck-150 allows up to 11 groups; notes sit on the line they describe

Sources:
- commit Eval: vitadeck-150 allows up to 11 groups; notes sit on the line they describe

The title:

Eval: vitadeck-150 allows up to 11 groups; notes sit on the line they describe

The what (trivial):

The vitadeck-150 case accepts up to 11 groups. The skill asks each note to sit on the line that does what it says.

## Review concerns

### 01 vitadeck-150 group limit (`case-limit`)

`case.json` raises `groups.max` from 9 to 11, and `expected.md` says a part may split into two groups.

[groups/case-limit.md](groups/case-limit.md)

### 02 Notes pin the doing line (`note-line`)

The note rule now asks for the line that does what the note says. The `.agents/skills` copy is the same edit from `pnpm sync:skill`; skip it.

[groups/note-line.md](groups/note-line.md)