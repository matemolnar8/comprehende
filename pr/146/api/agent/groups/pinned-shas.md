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

Review concern 01 of 06: Record the resolved commits in source (`pinned-shas`)

The why:

[#88](source:s1) asks to record the base and head SHAs. `refresh` needs them to know which range the document was written for; a branch ref alone resolves to the new head and hides the old one.

The what:

`resolveSource` in `src/git/diff.ts` puts `baseSha` and `headSha` into `source`, and `src/schema/review.ts` accepts them as optional fields.

Look for:
- Both fields are optional, so a document written by an older CLI still parses, serves, and validates. Only `refresh` rejects it, with a message that names `pregroup`.

Hunk refs for this concern:
- src/schema/review.ts
- src/git/diff.ts