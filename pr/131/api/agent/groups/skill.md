Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 78b8cdbc1a55f6c0bd0da551ff2c9c98544ca9c5` and `git rev-parse --verify 8c5594bbc15b7382c254dbd821ad68b5dadafbc0` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 78b8cdbc1a55f6c0bd0da551ff2c9c98544ca9c5 8c5594bbc15b7382c254dbd821ad68b5dadafbc0 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  78b8cdbc1a55f6c0bd0da551ff2c9c98544ca9c5

head               8c5594bbc15b7382c254dbd821ad68b5dadafbc0

Named refs at pin: origin/HEAD ... HEAD

Read the diff:

git diff --find-renames 78b8cdbc1a55f6c0bd0da551ff2c9c98544ca9c5 8c5594bbc15b7382c254dbd821ad68b5dadafbc0

Review concern 03 of 03: Digest-first skill and docs (`skill`)

Part: Digest-first

The why:

The draft and digest only save tokens when the skill works from them in batched calls [as asked](source:s3).

The what:

The skill batches sources and fetches with a size-scaled allowance, and the README documents the new commands.

Depends on:
- 02 Digest, show, and pregroup commands (`digest-cli`)

Hunk refs for this concern:
- .agents/skills/comprehende/SKILL.md@17+17
- .agents/skills/comprehende/SKILL.md@72+83
- .agents/skills/comprehende/SKILL.md@82+93
- .agents/skills/comprehende/SKILL.md@94+105
- .agents/skills/comprehende/SKILL.md@114+125
- skills-next/comprehende/SKILL.md@17+17
- skills-next/comprehende/SKILL.md@72+83
- skills-next/comprehende/SKILL.md@82+93
- skills-next/comprehende/SKILL.md@94+105
- skills-next/comprehende/SKILL.md@114+125
- scripts/eval/skill.test.ts@19+19
- scripts/eval/skill.test.ts@31+31
- src/schema/skill-sync.test.ts
- README.md