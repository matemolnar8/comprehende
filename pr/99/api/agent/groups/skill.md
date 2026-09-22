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

Review concern 01 of 03: Next skill workflow (`skill`)

The why:

[#96](source:s1) names the skill-only C+D edits. [matemolnar8](source:s3) then asks that lockfile excludes match the reviewed project, not a fixed list.

The what:

`skills-next/comprehende/SKILL.md` batches producer shell calls, points at example.md, excludes lockfiles from the covering `--stat`, and names commit source labels.

Look for:
- Subtle. Step 2 runs `npm view` in the same shell as `review`. A newer published version is noticed only after the skeleton already exists.
- [matemolnar8](source:s3) wants excludes for lockfiles in this covering change. Step 3 builds `:(exclude)<path>` from `--stat`, not a canned multi-ecosystem list.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md @@ -19,18 +19,29 @@
- skills-next/comprehende/SKILL.md @@ -53,14 +64,14 @@
- skills-next/comprehende/SKILL.md @@ -85,7 +96,7 @@
- skills-next/comprehende/references/example.md @@ -1,6 +1,6 @@