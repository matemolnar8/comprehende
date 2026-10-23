Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8` and `git rev-parse --verify a19cd266478558d40de20ddf11a948e8e7263d5d` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8 a19cd266478558d40de20ddf11a948e8e7263d5d -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8

head               a19cd266478558d40de20ddf11a948e8e7263d5d

Named refs at pin: 10dbe41 ... a19cd26

Read the diff:

git diff --find-renames 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8 a19cd266478558d40de20ddf11a948e8e7263d5d

Review concern 07 of 07: The skill in three tool calls (`skill`)

Part: Skill rewrite

The why:

[Every extra round trip re-sends the whole context, and the 40-line source cap cut the comments the model needed](source:s2); [the writing review removed duplicated rules and put the steps in run order](source:s4).

The what:

`skills-next/comprehende/SKILL.md` folds the source reads and `git log base..head` into the step-2 call, groups and fetches in one `show` call, writes `review.json` with a heredoc that ends in `validate`, names both `lookFor` fields in the write step, and caps each source at 10 kB; the `.agents` copies repeat it, `example.md` keeps the draft's `source` object, and `skill.test.ts` pins the new wording.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- .agents/skills/comprehende/SKILL.md
- skills-next/comprehende/references/example.md
- .agents/skills/comprehende/references/example.md
- scripts/eval/skill.test.ts