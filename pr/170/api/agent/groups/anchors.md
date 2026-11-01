Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 5f50618caf4f4029e5dbba2aa5e83419842b8460` and `git rev-parse --verify 73fa6a3083d3566e3fdecdab0e13391332c2643b` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 5f50618caf4f4029e5dbba2aa5e83419842b8460 73fa6a3083d3566e3fdecdab0e13391332c2643b -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  5f50618caf4f4029e5dbba2aa5e83419842b8460

head               73fa6a3083d3566e3fdecdab0e13391332c2643b

Named refs at pin: origin/t3/group-attention-164 ... HEAD

Read the diff:

git diff --find-renames 5f50618caf4f4029e5dbba2aa5e83419842b8460 73fa6a3083d3566e3fdecdab0e13391332c2643b

Review concern 02 of 07: validate and refresh (`anchors`)

The why:

[#163](source:s1) wants a range or note outside its hunk to fail loudly, and refresh to carry each one by hunk status.

The what:

`anchorErrors` in `anchors.ts` runs from `cmdValidate`, and `carryAnchors` runs inside `refreshDocument` to shift or drop each anchor.

Attention (tradeoff):
A `reformat` hunk drops its ranges and notes like a `changed` one, because whitespace edits can move lines inside the hunk. A whitespace-only push loses them, and the agent writes them again.

Depends on:
- 01 Focus and note fields (`schema`)

Hunk refs for this concern:
- src/review/anchors.ts
- src/review/anchors.test.ts
- src/review/refresh.ts
- src/review/refresh.test.ts
- src/cli/commands.ts
- src/test/covering-document.ts