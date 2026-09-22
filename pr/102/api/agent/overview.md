Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 94cb4481550de0078f0e6593b69fa3d52c5730a9` and `git rev-parse --verify 432d6476d1f70b132ceb575a11516fc903b88e36` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  94cb4481550de0078f0e6593b69fa3d52c5730a9

head               432d6476d1f70b132ceb575a11516fc903b88e36

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 94cb4481550de0078f0e6593b69fa3d52c5730a9 432d6476d1f70b132ceb575a11516fc903b88e36

Commits:
- 432d647 Record producer-token experiments against the current skill.

Sources:
- transcript Cursor session · Sep 22 Asks for experiments that cut producer tokens without losing review fidelity, and points at issue 94.
- commit Record producer-token experiments against the current skill. Headers-only and a plan-file expander did not give a reliable token cut.

The title:

Producer token experiments

The why:

The [Sep 22 session](source:s1) asks what can cut producer tokens without thinning the review, after steps fell and tokens did not.

The what (small):

`docs/producer-efficiency-experiments.md` records producer runs of the current skill, a plan-file expander, and a headers-only diff.

Look for:
- The [Sep 22 session](source:s1) asks for a way to spend fewer producer tokens without a thinner review. This note reports the runs and names file-level refs as the next measurement, with no skill or schema change in the diff.

## Review concerns

### 01 Producer efficiency note (`notes`)

The note tables static token sizes and the producer runs, and leaves the covering diff in the skill.

[groups/notes.md](groups/notes.md)