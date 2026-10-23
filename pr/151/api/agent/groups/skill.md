Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify f8c3ec7e32977154f65bca52b8d4b71cf8c2f179` and `git rev-parse --verify 874400fb8405fdc380f0c9911983ca94756f9214` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames f8c3ec7e32977154f65bca52b8d4b71cf8c2f179 874400fb8405fdc380f0c9911983ca94756f9214 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  f8c3ec7e32977154f65bca52b8d4b71cf8c2f179

head               874400fb8405fdc380f0c9911983ca94756f9214

Named refs at pin: f8c3ec7 ... 874400f

Read the diff:

git diff --find-renames f8c3ec7e32977154f65bca52b8d4b71cf8c2f179 874400fb8405fdc380f0c9911983ca94756f9214

Review concern 02 of 02: Step 3 names the stories; the size rule loses its group count (`skill`)

Part: Skill steps

The why:

[The parts rule sat in Grouping rules and the step-4 Done and fired in under a third of the runs on a mixed PR, and a sentence that tied trivial and small to one to three groups invited reading a group count as a size](source:s3).

The what:

Step 3 of `skills-next/comprehende/SKILL.md` adds one action, name each story that could have been its own PR and give it a `part`, with a Done that checks it; step 2 tells the reader to trust the new `replaces` hint; the Grouping rules size bullet drops its group-count sentence; the `.agents` copy repeats the same four lines.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- .agents/skills/comprehende/SKILL.md