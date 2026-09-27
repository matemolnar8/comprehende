Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 828059462124f776a8c04caf44e08f150f14bf76` and `git rev-parse --verify e8e77dd12ae08febf6bf96d94a7ad953c901de47` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  828059462124f776a8c04caf44e08f150f14bf76

head               e8e77dd12ae08febf6bf96d94a7ad953c901de47

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 828059462124f776a8c04caf44e08f150f14bf76 e8e77dd12ae08febf6bf96d94a7ad953c901de47

Commits:
- e8e77dd Skill: state large size without this repo's layers
- 5d029c3 Skill: a cross-layer contract stays large when groups merge

Sources:
- transcript Cursor session · Sep 26 comprehende-47 was medium with four groups. The size example must not name this repo's checks, UI, or instructions.

The title:

Keep size guidance general

The why:

[The eval](source:s1) scored a new contract medium when its groups were merged. The size rule has to say that for any repository.

The what (small):

A new contract that later groups depend on stays large when those groups merge. The project rule keeps this repo's layers out of skill examples.

## Review concerns

### 01 Size stays large when groups merge (`size-rule`)

`skills-next` says a contract later groups depend on is large, and the `.agents` copy is identical.

[groups/size-rule.md](groups/size-rule.md)

### 02 Skill examples stay general (`skill-examples`)

`AGENTS.md` tells skill authors to write rules that fit any repository.

[groups/skill-examples.md](groups/skill-examples.md)