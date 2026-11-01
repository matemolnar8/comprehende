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

Review concern 06 of 07: Skill and glossary (`skill`)

The why:

[#163](source:s1) asks the skill to say when to write a focus range or a note, and the glossary to define both.

The what:

A Focus and notes section in `SKILL.md` says when to write each one: a range covers the lines that carry the concern, in a test the call and its assertions. `example.md` and the glossary show both beside attention and questions.

Depends on:
- 01 Focus and note fields (`schema`)

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- skills-next/comprehende/references/example.md
- docs/glossary.md