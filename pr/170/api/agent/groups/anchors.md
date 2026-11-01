Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae` and `git rev-parse --verify 40fb350b116d4142086135bae7691f55d33ea6b1` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae 40fb350b116d4142086135bae7691f55d33ea6b1 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  3d282dc3d8e5a36190f501ab5d73fa0b9f138cae

head               40fb350b116d4142086135bae7691f55d33ea6b1

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae 40fb350b116d4142086135bae7691f55d33ea6b1

Review concern 02 of 07: validate and refresh (`anchors`)

The why:

[#163](source:s1) asks `validate` to fail loudly on a range or note outside its hunk, and `refresh` to carry each one by hunk status.

The what:

`cmdValidate` adds `anchorErrors` from `anchors.ts`, and `refreshDocument` calls `carryAnchors` to shift or drop each anchor.

Attention (tradeoff):
`carryAnchors` keeps an anchor only on a `same` hunk. A whitespace-only push makes the hunk `reformat`, so its ranges and notes drop, and the agent writes them again. Decide whether that loss is worth the safety.

Depends on:
- 01 Focus and note fields (`schema`)

Hunk refs for this concern:
- src/review/anchors.ts
- src/review/anchors.test.ts
- src/review/refresh.ts
- src/review/refresh.test.ts
- src/cli/commands.ts@1+1
- src/cli/commands.ts@66+62
- src/test/covering-document.ts