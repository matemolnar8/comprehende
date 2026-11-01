Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify edf8493d0359215e44fbe8b801c108ca61c609a2` and `git rev-parse --verify e9f4feaea4f6a3725324ae13159d13fcb53ef6c9` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames edf8493d0359215e44fbe8b801c108ca61c609a2 e9f4feaea4f6a3725324ae13159d13fcb53ef6c9 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  edf8493d0359215e44fbe8b801c108ca61c609a2

head               e9f4feaea4f6a3725324ae13159d13fcb53ef6c9

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames edf8493d0359215e44fbe8b801c108ca61c609a2 e9f4feaea4f6a3725324ae13159d13fcb53ef6c9

Review concern 03 of 07: Numbered show (`show`)

The why:

[#163](source:s1) asks `show` to print line numbers, so the agent copies them instead of counting from the `@@` header.

The what:

`numberedPatch` in `show.ts` numbers the raw hunk text, and `cmdShow` prints it for a file or a hunk.

Hunk refs for this concern:
- src/review/show.ts
- src/review/show.test.ts
- src/cli/commands.test.ts
- src/cli/commands.ts
- README.md