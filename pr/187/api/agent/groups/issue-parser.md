Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify f344a7c5055f503935fbff52c8574fe1233bd93a` and `git rev-parse --verify e6ae47d8c450a8c8fa3b0a50ed2d90413e236e92` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames f344a7c5055f503935fbff52c8574fe1233bd93a e6ae47d8c450a8c8fa3b0a50ed2d90413e236e92 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  f344a7c5055f503935fbff52c8574fe1233bd93a

head               e6ae47d8c450a8c8fa3b0a50ed2d90413e236e92

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames f344a7c5055f503935fbff52c8574fe1233bd93a e6ae47d8c450a8c8fa3b0a50ed2d90413e236e92

Review concern 04 of 07: Read issue lists (`issue-parser`)

Part: Read every file

The what:

`linkedIssueNumbers` reads every number in a list after a closing keyword, which `eval:add` needed for this case.

Hunk refs for this concern:
- scripts/eval/github.ts
- scripts/eval/github.test.ts