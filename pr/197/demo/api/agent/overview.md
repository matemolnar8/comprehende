Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 729cfd164d5cef0405a9f2753bc477540cd26ac9` and `git rev-parse --verify db4cb83388fe9468a33f57791ad9237c36dee108` in this repository.
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

base (merge-base)  729cfd164d5cef0405a9f2753bc477540cd26ac9

head               db4cb83388fe9468a33f57791ad9237c36dee108

Named refs at pin: db4cb833~1 ... db4cb833

Read the diff:

git diff --find-renames 729cfd164d5cef0405a9f2753bc477540cd26ac9 db4cb83388fe9468a33f57791ad9237c36dee108

Commits:
- db4cb833 Skill: rewrite for one place per rule; read by batch; terse fact list

The title:

Skill: rewrite for one place per rule

The what (medium):

The comprehende skill is rewritten so each rule has one place, the change is read by batch, and the fact list is terse.

## Review concerns

### 01 Skill rewrite (`skill`)

`SKILL.md` gets Ground rules, Grouping, and Fields sections, and the two reference files follow the new step numbers.

[groups/skill.md](groups/skill.md)

### 02 Synced copies (`synced`)

The `.agents/skills` copies that `pnpm sync:skill` writes. Safe to skip.

[groups/synced.md](groups/synced.md)