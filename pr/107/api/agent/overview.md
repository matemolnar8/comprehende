Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 078c8057b213f43f58ed34eb656fe4ac271d5f8e` and `git rev-parse --verify 8ec784735acf2ab1b549753b27af9048c32d423a` in this repository.
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

base (merge-base)  078c8057b213f43f58ed34eb656fe4ac271d5f8e

head               8ec784735acf2ab1b549753b27af9048c32d423a

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 078c8057b213f43f58ed34eb656fe4ac271d5f8e 8ec784735acf2ab1b549753b27af9048c32d423a

Commits:
- 8ec7847 Expect the workflow to leave the example file unread.
- f85bba7 Point the producer at the skeleton list fields.
- 3d12034 Write empty list fields on the review skeleton.

Sources:
- transcript Cursor session · Sep 22 The producer should learn the review shape from the skeleton. The workflow should not send it to example.md.

The title:

Show list fields on the review skeleton

The why:

[This session](source:s1) asks the skeleton to show the review shape so the producer does not open `references/example.md`.

The what (small):

`skeletonDocument` writes empty list arrays. The skill reads those fields from the skeleton.

Look for:
- The published `skills/comprehende` copy still points at `references/example.md` and `review.schema.json`. [This session](source:s1) leaves that copy for a later release.

## Review concerns

### 01 Empty list fields (`skeleton`)

`skeletonDocument` writes empty `parts`, `sources`, and `lookFor` arrays, and the covering group writes empty `lookFor`, `dependsOn`, and `sources`.

[groups/skeleton.md](groups/skeleton.md)

### 02 Workflow wording (`workflow`)

`skills-next/comprehende/SKILL.md` names the skeleton's empty arrays as the list fields, and `skill.test.ts` rejects a pointer at `references/example.md`.

Depends on:
- 01 Empty list fields (`skeleton`)

[groups/workflow.md](groups/workflow.md)

### 03 Skeleton checks (`checks`)

`skeleton.test.ts` and `pack-smoke.ts` expect the empty arrays, and `cmdValidate` still accepts the skeleton.

Depends on:
- 01 Empty list fields (`skeleton`)

[groups/checks.md](groups/checks.md)

### 04 Installed skill copy (`installed-copy`)

`.agents/skills/comprehende/SKILL.md` carries the same workflow wording as `skills-next`.

Depends on:
- 02 Workflow wording (`workflow`)

[groups/installed-copy.md](groups/installed-copy.md)