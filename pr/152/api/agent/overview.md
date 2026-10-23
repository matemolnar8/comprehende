Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 279fddef1703cf4e437eb2fdf5e9b16662b1f178` and `git rev-parse --verify efe129d2dea21d8787fee91179c7aad2f3558ded` in this repository.
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

base (merge-base)  279fddef1703cf4e437eb2fdf5e9b16662b1f178

head               efe129d2dea21d8787fee91179c7aad2f3558ded

Named refs at pin: 279fdde ... efe129d

Read the diff:

git diff --find-renames 279fddef1703cf4e437eb2fdf5e9b16662b1f178 efe129d2dea21d8787fee91179c7aad2f3558ded

Commits:
- efe129d Skill: the write step names the one-relation summary and the citation rule

Sources:
- transcript Claude Code session · Oct 2026 Máté asked to chase the prose-major increase seen after PR #151 merged.
- commit Skill: the write step names the one-relation summary and the citation rule The write step now states the summary and citation rules that lived only in The what and The why.

The title:

The write step names the one-relation summary and the citation rule

The why:

[After the parts action, the prose grader's majors rose, mostly group summaries that list files and whys that cite a source for what it does not say; both rules lived only in reference sections](source:s1).

The what (trivial):

One sentence in step 4 of the skill says a group summary names one relation among its hunks, not a file list, and a citation carries only what its source says.

## Review concerns

### 01 Step 4 states the summary and citation rules (`skill`)

`skills-next/comprehende/SKILL.md` step 4 gains one sentence between the per-group fields and the lookFor pointer, and the `.agents` copy repeats it.

[groups/skill.md](groups/skill.md)