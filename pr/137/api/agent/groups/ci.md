Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 59f1ceb487f0bbfa730b2919a93d1fb33c8bec19` and `git rev-parse --verify ffd116fb87c2578ef771cde505ed2a73bc886eda` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 59f1ceb487f0bbfa730b2919a93d1fb33c8bec19 ffd116fb87c2578ef771cde505ed2a73bc886eda -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  59f1ceb487f0bbfa730b2919a93d1fb33c8bec19

head               ffd116fb87c2578ef771cde505ed2a73bc886eda

Named refs at pin: main ... feature/eval-musecode-only

Read the diff:

git diff --find-renames 59f1ceb487f0bbfa730b2919a93d1fb33c8bec19 ffd116fb87c2578ef771cde505ed2a73bc886eda

Review concern 05 of 06: Muse-only eval workflow (`ci`)

The why:

CI provisions the CLI the evals run in and skips cleanly without its key [simpler eval.yml](source:s1).

The what:

eval.yml installs Muse Code unconditionally, gates on MUSE_CODE_API_KEY, and runs the suite without fallback flags.

Depends on:
- 01 Muse-only producer and graders (`runner`)

Hunk refs for this concern:
- .github/workflows/eval.yml