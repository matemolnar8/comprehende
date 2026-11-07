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

Review concern 01 of 06: Read every changed file (`read-every-file`)

Part: Read every file

The what:

Step 3 now fetches every file that can hold logic, and step 4 keeps what that reading finds. Sources print their size, and a claim outside the diff rests on `git grep`.

Attention (tradeoff):
Step 3 has no limit at any size of change. On `vitadeck-144`, Muse producer tokens rose from about 1.4M to about 5.9M, mostly cached, and generation from about 5.5 to 8.5 minutes. False bullets fell from 14 of 242 to 4 of 243. Decide whether very large changes need a limit.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md@9+9
- skills-next/comprehende/SKILL.md@37+39
- skills-next/comprehende/SKILL.md@65+70
- skills-next/comprehende/SKILL.md@88+93
- skills-next/comprehende/SKILL.md@175+151
- skills-next/comprehende/SKILL.md@202+177
- skills-next/comprehende/SKILL.md@212+187
- skills-next/comprehende/references/powershell.md