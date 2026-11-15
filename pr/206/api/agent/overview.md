Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 463f7b51c9de30a6c08179ef8c33b1d501a0021e` and `git rev-parse --verify 3b56e697bae7030e2cfe3b2cfbd8a42268cbfdc3` in this repository.
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

base (merge-base)  463f7b51c9de30a6c08179ef8c33b1d501a0021e

head               3b56e697bae7030e2cfe3b2cfbd8a42268cbfdc3

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 463f7b51c9de30a6c08179ef8c33b1d501a0021e 3b56e697bae7030e2cfe3b2cfbd8a42268cbfdc3

Commits:
- 3b56e697 Docs: fix claims the code contradicts and cut repeated text
- 1b290cba Agent skills: drop the unused unslop and frontend-design skills
- 3715bd1f Skill: a group may ask two questions, as the schema allows

Sources:
- transcript Claude Code session · Nov 15 Markdown audit with a council; owner picks two questions and drops both skills.

The title:

Docs match the code, with less repeated text

The why:

[The owner](source:s1) asks to check every markdown file for correctness and to delete redundant, tautological documentation.

The what (small):

Fixes doc claims the code contradicts, cuts repeated docs, allows two questions, and drops two skills.

## Review concerns

### 01 Claims the code contradicts (`fixes`)

Each edited sentence now matches the code it names, such as `defaultBaseRef` trying `trunk` and the eval exit rule in `checks.ts`.

[groups/fixes.md](groups/fixes.md)

### 02 Repeated text cut (`trims`)

Text that repeated another doc or a file listing now points at the one place that owns it.

Depends on:
- 01 Claims the code contradicts (`fixes`)

[groups/trims.md](groups/trims.md)

### 03 Two questions per group (`questions`)

The skill now allows at most two questions per group, which `review.ts` already accepts. The `.agents` file is the synced copy.

[groups/questions.md](groups/questions.md)

### 04 Unused vendored skills (`skills`)

Deletes the `unslop` and `frontend-design` skills and their `skills-lock.json` pins; no file in the repo names them.

[groups/skills.md](groups/skills.md)