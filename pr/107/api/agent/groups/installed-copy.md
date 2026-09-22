Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 078c8057b213f43f58ed34eb656fe4ac271d5f8e` and `git rev-parse --verify 8ec784735acf2ab1b549753b27af9048c32d423a` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 078c8057b213f43f58ed34eb656fe4ac271d5f8e 8ec784735acf2ab1b549753b27af9048c32d423a -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  078c8057b213f43f58ed34eb656fe4ac271d5f8e

head               8ec784735acf2ab1b549753b27af9048c32d423a

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 078c8057b213f43f58ed34eb656fe4ac271d5f8e 8ec784735acf2ab1b549753b27af9048c32d423a

Review concern 04 of 04: Installed skill copy (`installed-copy`)

The why:

The pre-commit skill check requires `.agents/skills/comprehende` to match `skills-next`.

The what:

`.agents/skills/comprehende/SKILL.md` carries the same workflow wording as `skills-next`.

Depends on:
- 02 Workflow wording (`workflow`)

Hunk refs for this concern:
- .agents/skills/comprehende/SKILL.md @@ -39,8 +39,8 @@