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

Review concern 07 of 07: Screenshots with a theme (`screenshots`)

Part: screenshots

The what:

`ui:screenshots --theme <file>` copies the file into the case repository as its theme. A run without the flag writes `{}` there, so a home theme cannot reach it.

Hunk refs for this concern:
- scripts/ui-screenshots.ts
- CONTRIBUTING.md