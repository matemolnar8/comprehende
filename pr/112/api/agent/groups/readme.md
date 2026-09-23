Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify d68a36eb83b8d412745643c86db7be65851f1c01` and `git rev-parse --verify fe3f8acbfa301232ca8380ef4377aee004f1d3f5` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames d68a36eb83b8d412745643c86db7be65851f1c01 fe3f8acbfa301232ca8380ef4377aee004f1d3f5 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  d68a36eb83b8d412745643c86db7be65851f1c01

head               fe3f8acbfa301232ca8380ef4377aee004f1d3f5

Named refs at pin: main ... HEAD

Read the diff:

git diff --find-renames d68a36eb83b8d412745643c86db7be65851f1c01 fe3f8acbfa301232ca8380ef4377aee004f1d3f5

Review concern 03 of 03: Note where viewed marks live (`readme`)

Part: Files left

The why:

Serve and export share this UI, so the README states where a viewed mark lives. The note exists because the UI now shows the count.

The what:

The Develop section says a viewed mark stays in the browser session and is not stored in the review file.

Depends on:
- 02 Show the count in the review (`marks`)

Hunk refs for this concern:
- README.md