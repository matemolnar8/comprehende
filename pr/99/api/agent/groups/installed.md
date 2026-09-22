Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a05aef85c489e9ccd5c42f7b3397219b35b95719` and `git rev-parse --verify afe0cb057f5dda1c09bc66a2012a0b06ca60156a` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a05aef85c489e9ccd5c42f7b3397219b35b95719 afe0cb057f5dda1c09bc66a2012a0b06ca60156a -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a05aef85c489e9ccd5c42f7b3397219b35b95719

head               afe0cb057f5dda1c09bc66a2012a0b06ca60156a

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a05aef85c489e9ccd5c42f7b3397219b35b95719 afe0cb057f5dda1c09bc66a2012a0b06ca60156a

Review concern 02 of 03: Installed skill mirror (`installed`)

The why:

The CLI sync copies skills-next into .agents so the installed skill matches the next skill. [matemolnar8](source:s3) pinned the exclude list on this copy.

The what:

`.agents/skills/comprehende` repeats the same SKILL.md and example.md edits.

Depends on:
- 01 Next skill workflow (`skill`)

Hunk refs for this concern:
- .agents/skills/comprehende/SKILL.md @@ -19,18 +19,29 @@
- .agents/skills/comprehende/SKILL.md @@ -53,14 +64,14 @@
- .agents/skills/comprehende/SKILL.md @@ -85,7 +96,7 @@
- .agents/skills/comprehende/references/example.md @@ -1,6 +1,6 @@