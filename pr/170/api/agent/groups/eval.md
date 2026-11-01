Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae` and `git rev-parse --verify b4365a5a3581593baf3069bc034b5e63104038fb` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae b4365a5a3581593baf3069bc034b5e63104038fb -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  3d282dc3d8e5a36190f501ab5d73fa0b9f138cae

head               b4365a5a3581593baf3069bc034b5e63104038fb

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 3d282dc3d8e5a36190f501ab5d73fa0b9f138cae b4365a5a3581593baf3069bc034b5e63104038fb

Review concern 05 of 07: Eval grading (`eval`)

The why:

[#163](source:s1) asks for rubric lines for focus ranges and notes.

The what:

`packet.ts` lists each group's ranges and notes for the grader, `graders.ts` checks each caption and note at head, and three `expected.md` files gain focus and note rubric lines.

Depends on:
- 01 Focus and note fields (`schema`)

Hunk refs for this concern:
- scripts/eval/packet.ts
- scripts/eval/graders.ts
- scripts/eval/graders.test.ts
- scripts/eval/checks.ts
- scripts/eval/args.ts
- docs/eval.md
- eval/cases/cobra-2356/expected.md
- eval/cases/comprehende-57/expected.md
- eval/cases/flask-6096/expected.md