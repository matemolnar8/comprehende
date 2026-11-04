Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 587e7aebf3074a2288cf7bee6eacfddba4bb3073` and `git rev-parse --verify bb865b7baa24a3c16de3c9282e41c4d095c15628` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 587e7aebf3074a2288cf7bee6eacfddba4bb3073 bb865b7baa24a3c16de3c9282e41c4d095c15628 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  587e7aebf3074a2288cf7bee6eacfddba4bb3073

head               bb865b7baa24a3c16de3c9282e41c4d095c15628

Named refs at pin: 587e7aeb ... bb865b7b

Read the diff:

git diff --find-renames 587e7aebf3074a2288cf7bee6eacfddba4bb3073 bb865b7baa24a3c16de3c9282e41c4d095c15628

Review concern 08 of 08: Reproducible UI screenshots (`screenshots`)

The why:

Máté asks for reference screenshots that cover the UI and that can run again later [session](source:s2).

The what:

`pnpm ui:screenshots` runs `scripts/ui-screenshots.ts`, which builds the UI, rebuilds the `cigster-99` eval repo from its bundle, serves it with the saved review, and shoots 6 scenes with Playwright into the gitignored `fixtures/screenshots/`.

Attention (risk):
`runUiScreenshots` runs `rm` with `recursive` and `force` on `fixtures/screenshot-repos` and on the `--out` folder before every run. `--out` is not checked, so a wrong path deletes that folder and everything in it. The default is the gitignored `fixtures/screenshots`.

Hunk refs for this concern:
- scripts/ui-screenshots.ts
- scripts/ui-screenshots.review.json
- package.json
- .gitignore
- CONTRIBUTING.md