Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 7346f9664030764a93e78942373251c29a5f4803` and `git rev-parse --verify a476ce89308f686f4349f0c94cb750a094e8b51b` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 7346f9664030764a93e78942373251c29a5f4803 a476ce89308f686f4349f0c94cb750a094e8b51b -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  7346f9664030764a93e78942373251c29a5f4803

head               a476ce89308f686f4349f0c94cb750a094e8b51b

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 7346f9664030764a93e78942373251c29a5f4803 a476ce89308f686f4349f0c94cb750a094e8b51b

Review concern 05 of 07: Skill detects the shell and has PowerShell blocks (`skill-shells`)

Part: Windows support

The why:

Agents must find out which shell they run in [and adapt](source:s1).

The what:

SKILL.md names bash, zsh, or PowerShell, and points a PowerShell agent at `references/powershell.md`, which replaces the blocks of Workflow steps 2 and 4 and of Refresh; README states the supported shells.

Depends on:
- 02 Read review.json in PowerShell encodings (`encodings`)

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- skills-next/comprehende/references/powershell.md
- README.md