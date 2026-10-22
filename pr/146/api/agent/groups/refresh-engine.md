Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ae1bc763799faf6e9cb24702f6267c2807d6d72f` and `git rev-parse --verify e340814958bfa548fa7175750c2639ca225b0dca` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames ae1bc763799faf6e9cb24702f6267c2807d6d72f e340814958bfa548fa7175750c2639ca225b0dca -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  ae1bc763799faf6e9cb24702f6267c2807d6d72f

head               e340814958bfa548fa7175750c2639ca225b0dca

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames ae1bc763799faf6e9cb24702f6267c2807d6d72f e340814958bfa548fa7175750c2639ca225b0dca

Review concern 02 of 06: Match hunks across ranges and rewrite the refs (`refresh-engine`)

The why:

The [commit](source:s3) names the rules: a hunk with the same path and changed lines keeps its ref, an edit in the same region is changed and keeps its group, everything else is new or gone. This group is that engine and its report.

The what:

`matchHunks` in `src/review/refresh.ts` pairs old and new hunks as same, changed, or reformat, `refreshDocument` re-points or drops refs and drafts an `update` group for uncovered hunks, `formatRefresh` prints the delta digest, `listNewSubjects` in `src/git/log.ts` lists the new commit subjects, and `reviewFileBody` moves from the test helper into `src/review/write.ts`.

Look for:
- Subtle. An edited hunk pairs with the first unmatched old hunk in the same file whose old-side line range overlaps, context lines included. One old hunk split into two reports the second as new; two old hunks merged into one report the second old as gone. Both cases are honest, just noisier than the common edit.
- Image hunks have no lines, so they match on the file's `headerPatch` (the blob ids). A changed image is reported as changed, not same.
- A located ref that matched neither the previous diff nor the live diff is dropped and counted as gone. Nothing is invented in its place.
- `listNewSubjects` runs `git log --right-only --cherry-pick old...new ^base`, so a rebase lists only the commits added on top and a merge of the base lists the merge commit plus new work. Upstream commits never appear.
- `refreshDocument` returns a new document; the input is not mutated. The written key order follows the schema, so a refreshed file may reorder top-level keys once.
- A changed hunk whose added text and removed text are the same once every whitespace character is dropped is `reformat`, not `changed`. Both small-delta simulation runs spent their one `show` fetch on such a hunk; the skill now skips that fetch.

Depends on:
- 01 Record the resolved commits in source (`pinned-shas`)

Hunk refs for this concern:
- src/review/refresh.ts
- src/review/refresh.test.ts
- src/review/write.ts
- src/git/log.ts
- src/test/covering-document.ts