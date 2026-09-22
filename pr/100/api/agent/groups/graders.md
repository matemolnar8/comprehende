Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a05aef85c489e9ccd5c42f7b3397219b35b95719` and `git rev-parse --verify 0ff61b34155dc82c9265347a7d6464fc0faeaff6` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a05aef85c489e9ccd5c42f7b3397219b35b95719 0ff61b34155dc82c9265347a7d6464fc0faeaff6 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a05aef85c489e9ccd5c42f7b3397219b35b95719

head               0ff61b34155dc82c9265347a7d6464fc0faeaff6

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a05aef85c489e9ccd5c42f7b3397219b35b95719 0ff61b34155dc82c9265347a7d6464fc0faeaff6

Review concern 03 of 03: Grade from an inline packet with no tools (`graders`)

The why:

[#97](source:s1) says graders were about 79% of eval tokens because they had `read`/`grep`/`glob`/`ls` and walked the work tree.

The what:

`groupingPrompt` and `prosePrompt` embed the packet. `GRADER_TOOLS` is empty, so `runGrader` offers no built-in tools.

Look for:
- Subtle. `tools: []` is deny-all. Omitting `tools` would restore the default toolset.

Hunk refs for this concern:
- scripts/eval/constants.ts @@ -3,4 +3,5 @@
- scripts/eval/graders.ts @@ -46,7 +46,7 @@
- scripts/eval/graders.ts @@ -54,17 +54,19 @@
- scripts/eval/graders.ts @@ -88,11 +90,13 @@
- scripts/eval/graders.ts @@ -112,7 +116,7 @@
- scripts/eval/graders.ts @@ -123,7 +127,7 @@
- scripts/eval/run.ts @@ -186,14 +189,14 @@
- scripts/eval/run.ts @@ -202,7 +205,7 @@
- scripts/eval/graders.test.ts @@ -1,7 +1,39 @@
- scripts/eval/graders.test.ts @@ -50,6 +82,47 @@