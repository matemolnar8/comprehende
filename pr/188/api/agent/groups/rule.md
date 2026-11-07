Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify fb5512b5d35ae631ce90b41c889b41320b2e4e71` and `git rev-parse --verify fe7755cb3305c36d02540799ccfbf0e24a2415d5` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames fb5512b5d35ae631ce90b41c889b41320b2e4e71 fe7755cb3305c36d02540799ccfbf0e24a2415d5 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  fb5512b5d35ae631ce90b41c889b41320b2e4e71

head               fe7755cb3305c36d02540799ccfbf0e24a2415d5

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames fb5512b5d35ae631ce90b41c889b41320b2e4e71 fe7755cb3305c36d02540799ccfbf0e24a2415d5

Review concern 01 of 05: What counts as a story (`rule`)

The what:

Step 3 defines a story as work that could have been its own PR, and says a shared motive gives one `why`, not one story. `.agents/skills/comprehende/SKILL.md` is the synced copy of `skills-next/comprehende/SKILL.md`.

Attention (tradeoff):
Step 3 now asks the agent to split a retro or cleanup sweep into one part per fix, which can over-split. Two sentences hold it back: "One cause fixed in several places is one story", and small edits of one kind for one reader stay one story. Without the first, the single-bug `flask-6096-planted` case split into 2 parts in 2 of 2 runs.

Hunk refs for this concern:
- .agents/skills/comprehende/SKILL.md
- skills-next/comprehende/SKILL.md