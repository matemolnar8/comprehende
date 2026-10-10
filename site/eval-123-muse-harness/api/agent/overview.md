Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 9dd4b3ba64302a70f316f69651f42604cab649a4` and `git rev-parse --verify 96752e929acd94c298995370a505caffbf40f32b` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  9dd4b3ba64302a70f316f69651f42604cab649a4

head               96752e929acd94c298995370a505caffbf40f32b

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 9dd4b3ba64302a70f316f69651f42604cab649a4 96752e929acd94c298995370a505caffbf40f32b

Commits:
- 96752e9 Eval: carry the #123 fixes over to the Muse harness

Sources:
- ticket #123 A canceled Cursor agent stream kills the graded eval run partway, leaving later cases unfinished and no summary.json. It lists five harness fixes: settle the wait on cancel, retry the producer once, shorten grader timeouts and retry only on non-JSON text, print the producer error early, and run one eval at a time.
  https://github.com/matemolnar8/comprehende/issues/123
- transcript This session Check whether issue #123 is still relevant now that the harness runs on Muse, implement the parts that are, and open a pull request.

The title:

Eval: carry the #123 fixes over to the Muse harness

The why:

A failed agent run kills the whole graded eval run before later cases finish, leaving no summary.json [text](source:s1).

The what (small):

Carries the still-relevant fixes from issue #123 to the Muse-only eval harness, after the Cursor failure mode went away with #137.

## Review concerns

### 01 Survive transient agent failures in the eval harness (`harness-resilience`)

The producer retries once when the agent run fails without writing a review, and graders get a shorter timeout with retries only on non-JSON text. Failures print early and docs record the behavior.

[groups/harness-resilience.md](groups/harness-resilience.md)