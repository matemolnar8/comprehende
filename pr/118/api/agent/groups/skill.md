Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157` and `git rev-parse --verify ef1e688be084667a7f76ce365dfbe44bba1f7f55` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 ef1e688be084667a7f76ce365dfbe44bba1f7f55 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157

head               ef1e688be084667a7f76ce365dfbe44bba1f7f55

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames a6c2a1cddfe8c0639336e5a0c5b58ee0fbb6c157 ef1e688be084667a7f76ce365dfbe44bba1f7f55

Review concern 03 of 05: Skill rules the expects encode (`skill`)

The why:

[#117](source:s1) phase 2: change the skill until reviews match the expected outcomes.

The what:

The next skill checks each source against head, writes why only from a stated problem or goal, keeps tests and copies with the code they serve, and bullets hidden behavior and overridden ticket items.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- skills-next/comprehende/references/example.md