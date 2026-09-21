Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 18bd5cba8d77a1b2d462b98aece1d90746049f97` and `git rev-parse --verify 5e2acf536edc85c4c7dd4cfbb5f986ad40b49b98` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 18bd5cba8d77a1b2d462b98aece1d90746049f97 5e2acf536edc85c4c7dd4cfbb5f986ad40b49b98 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  18bd5cba8d77a1b2d462b98aece1d90746049f97

head               5e2acf536edc85c4c7dd4cfbb5f986ad40b49b98

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 18bd5cba8d77a1b2d462b98aece1d90746049f97 5e2acf536edc85c4c7dd4cfbb5f986ad40b49b98

Review concern 04 of 04: Point agents at review (`docs`)

The why:

[The session](source:s1) asks skills-next and docs to re-run `review`, not `index`.

The what:

README, AGENTS.md, and the next-skill example send agents to `review`.

Hunk refs for this concern:
- .agents/skills/comprehende/references/example.md @@ -1,6 +1,6 @@
- AGENTS.md @@ -56,9 +56,9 @@
- AGENTS.md @@ -70,7 +70,7 @@
- README.md @@ -64,8 +64,6 @@
- skills-next/comprehende/references/example.md @@ -1,6 +1,6 @@
- src/schema/skill-sync.test.ts @@ -15,6 +15,9 @@