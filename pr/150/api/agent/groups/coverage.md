Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8` and `git rev-parse --verify a19cd266478558d40de20ddf11a948e8e7263d5d` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8 a19cd266478558d40de20ddf11a948e8e7263d5d -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8

head               a19cd266478558d40de20ddf11a948e8e7263d5d

Named refs at pin: 10dbe41 ... a19cd26

Read the diff:

git diff --find-renames 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8 a19cd266478558d40de20ddf11a948e8e7263d5d

Review concern 02 of 07: Coverage: the most specific ref wins (`coverage`)

Part: Directory refs

The why:

A directory ref must not swallow a file another group names, and must not hide a file with a real change; [the review of the first commit asked for both](source:s3).

The what:

`dirOwners` in `coverage.ts` gives each live hunk to the path ref that names it, else to the deepest directory ref, and `dirRefErrors` fails a directory ref that holds a file that is not mechanical; `checks.ts` repeats the same ownership rule for the eval cases, and the server and covering-document tests carry a directory ref.

Look for:
- Subtle: a path or hunk ref in any group takes the file out of every directory ref; a file named in two groups is still counted once per group, and a directory ref whose files are all named elsewhere matches nothing and is reported stale.

Depends on:
- 01 A hunk ref can be a directory (`ref-contract`)

Hunk refs for this concern:
- src/review/coverage.ts
- src/review/coverage.test.ts
- scripts/eval/checks.ts
- src/server/http.test.ts
- src/test/covering-document.ts