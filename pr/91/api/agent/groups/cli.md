Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff` and `git rev-parse --verify 8febfe58216a23b69f9e3f57c08518a67bafe9d4` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff 8febfe58216a23b69f9e3f57c08518a67bafe9d4 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff

head               8febfe58216a23b69f9e3f57c08518a67bafe9d4

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff 8febfe58216a23b69f9e3f57c08518a67bafe9d4

Review concern 02 of 06: review command (`cli`)

The why:

Agents need a named command that writes the skeleton from cwd git.

The what:

`comprehende review` takes the same `--base`/`--head` as `index`, requires `--data`, writes the skeleton path, and prints fill then validate/serve/export.

Depends on:
- 01 Covering skeleton (`skeleton`)

Hunk refs for this concern:
- src/cli/args.ts @@ -1,4 +1,4 @@
- src/cli/args.ts @@ -16,7 +16,7 @@
- src/cli/args.ts @@ -35,6 +35,10 @@
- src/cli/main.ts @@ -5,7 +5,7 @@
- src/cli/main.ts @@ -36,6 +36,20 @@