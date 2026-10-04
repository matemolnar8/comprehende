Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 78b8cdbc1a55f6c0bd0da551ff2c9c98544ca9c5` and `git rev-parse --verify 4436eb9e832e4c208e49426536711663295397f4` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 78b8cdbc1a55f6c0bd0da551ff2c9c98544ca9c5 4436eb9e832e4c208e49426536711663295397f4 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  78b8cdbc1a55f6c0bd0da551ff2c9c98544ca9c5

head               4436eb9e832e4c208e49426536711663295397f4

Named refs at pin: origin/HEAD ... HEAD

Read the diff:

git diff --find-renames 78b8cdbc1a55f6c0bd0da551ff2c9c98544ca9c5 4436eb9e832e4c208e49426536711663295397f4

Review concern 02 of 03: Digest, show, and pregroup commands (`digest-cli`)

Part: Digest-first

The why:

Grouping needs one line per file, not patch text; the CLI already owns git [as stated](source:s2).

The what:

`digest` prints one line per file with kind and hints, `show` prints one hunk or file, and `pregroup` drafts copy, mechanical, and change groups.

Hunk refs for this concern:
- src/review/digest.ts
- src/review/digest.test.ts
- src/cli/args.ts@1+1
- src/cli/args.ts@12+12
- src/cli/args.ts@36+46
- src/cli/args.ts@91+112
- src/cli/args.test.ts@15+15
- src/cli/args.test.ts@30+32
- src/cli/args.test.ts@45+49
- src/cli/commands.ts@1+1
- src/cli/commands.ts@47+49
- src/cli/commands.test.ts@5+5
- src/cli/commands.test.ts@94+94
- src/cli/main.ts@5+5
- src/cli/main.ts@77+77