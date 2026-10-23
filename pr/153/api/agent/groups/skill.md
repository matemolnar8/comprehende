Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify df677575fda82ed86e32754f10d70d9f5992cf23` and `git rev-parse --verify e7578d9f0cfb1119b603c616c364d2bb1e2436ac` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames df677575fda82ed86e32754f10d70d9f5992cf23 e7578d9f0cfb1119b603c616c364d2bb1e2436ac -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  df677575fda82ed86e32754f10d70d9f5992cf23

head               e7578d9f0cfb1119b603c616c364d2bb1e2436ac

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames df677575fda82ed86e32754f10d70d9f5992cf23 e7578d9f0cfb1119b603c616c364d2bb1e2436ac

Review concern 03 of 03: Three rules as step actions (`skill`)

Part: skill rules

The why:

A rule that lives only in a reference section stops firing for a busy step list; naming it in the step with its own Done brought lookFor, parts, and summaries back ([PR #153](source:s1)).

The what:

Step 3 gives the dependency policy story a concrete example, step 4 turns the citation rule into a find-the-sentence action with a Done clause and places shared helpers in the foundation group, and the foundation bullet in Grouping rules says the same; `.agents/skills/comprehende/SKILL.md` is the synced copy.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- .agents/skills/comprehende/SKILL.md