Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify f8c3ec7e32977154f65bca52b8d4b71cf8c2f179` and `git rev-parse --verify 874400fb8405fdc380f0c9911983ca94756f9214` in this repository.
   Done when both objects exist.

2. Choose the relevant review concerns.
   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.
   Done when every concern the question touches has its markdown loaded.

3. Answer from live git.
   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.
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

Commits:
- 874400f Digest: a replacement pairs one added file with one deleted file
- 0efb260 Digest: the deleted side of a replacement is not a move either
- 312a368 Skill: name each story as a part in step 3; drop the group-count size hint
- 0bd3c2d Digest: a new file that replaces a deleted one is not a move

Sources:
- transcript Claude Code session · Oct 2026 Máté asked whether the two failing eval cases could be improved without tailoring the skill to those PRs, noting the expectations might be off, then asked for the three proposed changes and a measurement.
- commit Digest: a new file that replaces a deleted one is not a move An added file whose name matches exactly one deleted file, with no rename detected, prints a replaces hint; the draft puts it in change, the collapse leaves it out, validate fails a directory ref that holds it.
- commit Skill: name each story as a part in step 3; drop the group-count size hint The parts rule lived in reference text and fired in under a third of runs on a mixed PR; the small-review group-count sentence reads backwards from a group count to a size.
- commit Digest: the deleted side of a replacement is not a move either The first round left the deleted goldens inside the directory ref and the grader flagged them; the deleted file now prints replaced by and leaves the collapse too.

The title:

Parts as a step action, a replaces hint in the digest, no group-count size hint

The why:

[The graded eval on main failed the parts and groups minimums of a mixed PR in every skill version, and sized a schema change small; the fix had to be general rules, not tailoring to those PRs](source:s1).

The what (small):

The digest pairs an added file with the deleted file of the same name and keeps both out of the mechanical draft and the directory collapse; the skill names each independent story as a part in step 3 and drops the sentence tying small reviews to a group count.

## Review concerns

### 01 A replaced file and its replacement are not mechanical (`replaces`)

`markReplaces` in `digest.ts` pairs an added file with the one deleted file of the same basename when git found no rename, `isMechanicalFile` says neither side is mechanical, so `pregroup` in `commands.ts` lists both in the change group, `mechanicalDirs` leaves them out of the directory collapse, and `dirRefErrors` in `coverage.ts` fails a directory ref that still holds one.

[groups/replaces.md](groups/replaces.md)

### 02 Step 3 names the stories; the size rule loses its group count (`skill`)

Step 3 of `skills-next/comprehende/SKILL.md` adds one action, name each story that could have been its own PR and give it a `part`, with a Done that checks it; step 2 tells the reader to trust the new `replaces` hint; the Grouping rules size bullet drops its group-count sentence; the `.agents` copy repeats the same four lines.

[groups/skill.md](groups/skill.md)