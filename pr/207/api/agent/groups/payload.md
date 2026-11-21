Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify bfea60b652d3a4a9d23c54569fe13c8f235eaac7` and `git rev-parse --verify cf48b4ef0645b871d6bae89e128514b537713b0c` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames bfea60b652d3a4a9d23c54569fe13c8f235eaac7 cf48b4ef0645b871d6bae89e128514b537713b0c -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  bfea60b652d3a4a9d23c54569fe13c8f235eaac7

head               cf48b4ef0645b871d6bae89e128514b537713b0c

Named refs at pin: origin/main ... origin/t3/add-theme-setup-cigster-demo

Read the diff:

git diff --find-renames bfea60b652d3a4a9d23c54569fe13c8f235eaac7 cf48b4ef0645b871d6bae89e128514b537713b0c

Review concern 02 of 07: Theme in the review payload (`payload`)

Part: themes

The what:

`openReview` loads the theme beside the repository identity, and `reviewPayload` sends it as `theme`, so an export carries it in `api/review.json`.

Attention (risk):
`loadTheme` throws on an invalid file, and `openReview` lets the error through. A broken `~/.comprehende/theme.json` makes `serve` and `export` fail in every repository without a project theme, until the user fixes it. The error names the file and the field.

Depends on:
- 01 Theme file and its check (`theme-file`)

Hunk refs for this concern:
- src/api/live.ts
- src/api/types.ts
- src/api/export.test.ts