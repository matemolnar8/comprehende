Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff` and `git rev-parse --verify 8febfe58216a23b69f9e3f57c08518a67bafe9d4` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff 8febfe58216a23b69f9e3f57c08518a67bafe9d4 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff

head               8febfe58216a23b69f9e3f57c08518a67bafe9d4

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff 8febfe58216a23b69f9e3f57c08518a67bafe9d4

Review concern 04 of 06: Skill starts from review (`skill`)

The why:

Cloud agents follow the next skill. If it still says run `index` and paste refs, they will keep pasting.

The what:

The next skill writes a covering skeleton with `review --data`, then fills and splits groups from those refs.

Depends on:
- 02 review command (`cli`)

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md @@ -27,12 +27,11 @@
- skills-next/comprehende/SKILL.md @@ -42,7 +41,7 @@
- skills-next/comprehende/SKILL.md @@ -85,11 +84,11 @@
- skills-next/comprehende/references/example.md @@ -1,6 +1,6 @@