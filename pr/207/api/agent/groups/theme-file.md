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

Review concern 01 of 07: Theme file and its check (`theme-file`)

Part: themes

The what:

`themeSchema` in `src/schema/theme.ts` defines the file, and `loadTheme` finds it in the repository root, else in the home folder, as [#184](source:s1) asks.

Attention (contract):
A value must be a literal colour: hex of 3, 4, 6, or 8 digits, or a colour function with numeric arguments. `{"dark":{"primary":"var(--brand)"}}` fails the parse, so a theme cannot point at the project's own variables. The repository file wins whole: a home file that sets `ring` gives nothing when the project file exists.

Hunk refs for this concern:
- src/schema/theme.ts
- src/api/theme.ts
- src/api/theme.test.ts