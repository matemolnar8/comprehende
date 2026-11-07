Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify f344a7c5055f503935fbff52c8574fe1233bd93a` and `git rev-parse --verify 85349f212f7388fa7e330e5f1bf229db21233f2d` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames f344a7c5055f503935fbff52c8574fe1233bd93a 85349f212f7388fa7e330e5f1bf229db21233f2d -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  f344a7c5055f503935fbff52c8574fe1233bd93a

head               85349f212f7388fa7e330e5f1bf229db21233f2d

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames f344a7c5055f503935fbff52c8574fe1233bd93a 85349f212f7388fa7e330e5f1bf229db21233f2d

Review concern 06 of 06: Trim the skill and move Refresh (`skill-cleanup`)

Part: Skill cleanup

The what:

Refresh moves behind a pointer, step 4 points at field sections, and `serve` runs in the background. `SKILL.md` goes from 6,684 to 5,595 words.

Attention (contract):
The Refresh pointer used to fire when a review document already existed. It now fires when the user names one, or when this session wrote one. A review from an earlier session that the user does not name starts a fresh review. Refresh has not run since the move.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md@9+9
- skills-next/comprehende/SKILL.md@88+93
- skills-next/comprehende/SKILL.md@105+110
- skills-next/comprehende/SKILL.md@155+131
- skills-next/comprehende/SKILL.md@175+151
- skills-next/comprehende/SKILL.md@223+198
- skills-next/comprehende/references/refresh.md
- scripts/eval/skill.test.ts