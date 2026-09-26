Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 828059462124f776a8c04caf44e08f150f14bf76` and `git rev-parse --verify 5d029c38c740e96de87bfffcade76effe1b3a55f` in this repository.
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

head               5d029c38c740e96de87bfffcade76effe1b3a55f

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 828059462124f776a8c04caf44e08f150f14bf76 5d029c38c740e96de87bfffcade76effe1b3a55f

Commits:
- 5d029c3 Skill: a cross-layer contract stays large when groups merge

Sources:
- transcript Cursor session · Sep 26 Eval run 36224503332 failed only on comprehende-47 size: expected large or very-large, got medium, with 4 groups.

The title:

Keep a cross-layer contract large

The why:

[The eval on main](source:s1) failed because comprehende-47 was medium. The hand-written outcome for that case says large.

The what (small):

The size rule now calls a contract that the checks, the UI, and the instructions all use large, even when those layers share fewer groups.

## Review concerns

### 01 Size rule for a cross-layer contract (`size-rule`)

`skills-next` says that contract is large, and the `.agents` copy is identical.

[groups/size-rule.md](groups/size-rule.md)