Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a05aef85c489e9ccd5c42f7b3397219b35b95719` and `git rev-parse --verify d5c726fc18d330571360e3494af7bdd78ea6e0f3` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a05aef85c489e9ccd5c42f7b3397219b35b95719 d5c726fc18d330571360e3494af7bdd78ea6e0f3 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a05aef85c489e9ccd5c42f7b3397219b35b95719

head               d5c726fc18d330571360e3494af7bdd78ea6e0f3

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a05aef85c489e9ccd5c42f7b3397219b35b95719 d5c726fc18d330571360e3494af7bdd78ea6e0f3

Review concern 03 of 03: Inline the packet; keep work-tree tools (`graders`)

The why:

[#97](source:s1) says graders spent most eval tokens finding the packet and walking the tree. Mate’s review of [PR #100](source:s2) keeps the tools so they can check the code.

The what:

`groupingPrompt` and `prosePrompt` embed the packet and tell the grader to start from it, then read only the files a check needs. `GRADER_TOOLS` stays `read`/`grep`/`glob`/`ls`.

Look for:
- Subtle. The prompt still allows work-tree reads. `GRADER_TOOLS` is not empty. There is no maxSteps field on the agent run.

Hunk refs for this concern:
- scripts/eval/graders.ts @@ -22,6 +22,13 @@
- scripts/eval/graders.ts @@ -46,7 +53,7 @@
- scripts/eval/graders.ts @@ -54,17 +61,19 @@
- scripts/eval/graders.ts @@ -88,11 +97,13 @@
- scripts/eval/graders.ts @@ -112,7 +123,7 @@
- scripts/eval/graders.ts @@ -123,7 +134,7 @@
- scripts/eval/run.ts @@ -186,14 +189,14 @@
- scripts/eval/run.ts @@ -202,7 +205,7 @@
- scripts/eval/graders.test.ts @@ -1,7 +1,39 @@
- scripts/eval/graders.test.ts @@ -50,6 +82,50 @@