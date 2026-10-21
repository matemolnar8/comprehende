Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ae1bc763799faf6e9cb24702f6267c2807d6d72f` and `git rev-parse --verify 98f0fc86e7a373cabf4c55004f7e66825a40b5a6` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames ae1bc763799faf6e9cb24702f6267c2807d6d72f 98f0fc86e7a373cabf4c55004f7e66825a40b5a6 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  ae1bc763799faf6e9cb24702f6267c2807d6d72f

head               98f0fc86e7a373cabf4c55004f7e66825a40b5a6

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames ae1bc763799faf6e9cb24702f6267c2807d6d72f 98f0fc86e7a373cabf4c55004f7e66825a40b5a6

Review concern 04 of 06: The Refresh branch in the skill (`skill`)

The why:

The [session](source:s4) asked for the skill to support incremental updates. The new section tells the agent to copy the previous document, run `refresh`, fetch only new sources and new or changed hunks, and edit the named groups in place.

The what:

`skills-next/comprehende/SKILL.md` gains a Refresh section, a trigger in the description, a pointer at the top of the Workflow, and a stale-ref bullet that names `refresh`; `.agents/skills/comprehende/SKILL.md` is the identical synced copy and `src/schema/skill-sync.test.ts` pins the new sentence.

Look for:
- The `.agents` copy is identical to `skills-next`; read one. `pnpm check:skill` passes.
- Step 4 tells the agent to edit `review.json` in place instead of the one full write the main Workflow uses. That is the efficiency lever: unchanged groups never leave the file.

Depends on:
- 03 The refresh command and the drift note (`cli`)

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- .agents/skills/comprehende/SKILL.md
- src/schema/skill-sync.test.ts