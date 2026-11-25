Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify bbce124d61e23582ed867bb81e87e81a6db86c92` and `git rev-parse --verify 21fcf69fc5df0599eb0f52a74e9da3f68ac0e5a5` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames bbce124d61e23582ed867bb81e87e81a6db86c92 21fcf69fc5df0599eb0f52a74e9da3f68ac0e5a5 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  bbce124d61e23582ed867bb81e87e81a6db86c92

head               21fcf69fc5df0599eb0f52a74e9da3f68ac0e5a5

Named refs at pin: origin/main ... origin/t3/add-theme-picker-to-options-menu

Read the diff:

git diff --find-renames bbce124d61e23582ed867bb81e87e81a6db86c92 21fcf69fc5df0599eb0f52a74e9da3f68ac0e5a5

Review concern 01 of 03: Load both theme files (`load-both`)

The what:

`loadThemes` in `theme.ts` reads the repository file and the home file, and the payload sends both as `themes`. The `theme` command, `serve`, and `export` print one line per file they found.

Attention (risk):
`loadThemes` now always parses the home file, and an invalid file still throws. Before, a valid project theme meant the home file was never read; now a broken `~/.comprehende/theme.json` stops `serve` and `export` in every repository. The error names the file, as it did for the project file.

Hunk refs for this concern:
- src/api/theme.ts
- src/api/theme.test.ts
- src/api/types.ts
- src/api/live.ts
- src/api/export.test.ts
- src/api/agent-md.test.ts
- src/cli/main.ts
- src/cli/args.ts