Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82` and `git rev-parse --verify c77e82775e65bb5e490a77688e8ffd272829c18f` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82 c77e82775e65bb5e490a77688e8ffd272829c18f -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82

head               c77e82775e65bb5e490a77688e8ffd272829c18f

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames eb4b75bbd0b76e9b4f5d7d8462fbfb7331f57e82 c77e82775e65bb5e490a77688e8ffd272829c18f

Review concern 05 of 08: Eval packet and prose lints (`eval-prose`)

Part: Schema

The why:

It enables graders to see part summaries.

The what:

The grading packet lists `parts[]`, and prose lints walk each part summary.

Depends on:
- 01 Document parts array (`contract`)

Hunk refs for this concern:
- scripts/eval/checks.ts @@ -253,6 +253,9 @@
- scripts/eval/packet.ts @@ -17,6 +17,11 @@
- scripts/eval/packet.ts @@ -31,7 +36,7 @@