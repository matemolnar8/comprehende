Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify c1093ea2d07e3b2e5660edd75776ef686d8aa12b` and `git rev-parse --verify 4b4c6ee30f0d32c24aa64a810fd43738c4bb5b82` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames c1093ea2d07e3b2e5660edd75776ef686d8aa12b 4b4c6ee30f0d32c24aa64a810fd43738c4bb5b82 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  c1093ea2d07e3b2e5660edd75776ef686d8aa12b

head               4b4c6ee30f0d32c24aa64a810fd43738c4bb5b82

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames c1093ea2d07e3b2e5660edd75776ef686d8aa12b 4b4c6ee30f0d32c24aa64a810fd43738c4bb5b82

Review concern 01 of 02: Cite the comment that asked for the code (`skill-rule`)

The why:

[The debriefed runs left comments out because the PR body restated the outcome](source:s2), and the old rule emitted a `pr-comment` only when the prose already cited it.

The what:

The PR comments rule in The why and the Attention rule both now cite a review comment on the group that holds the code it asked for; `.agents/skills` repeats the same edit.

Attention (tradeoff):
Every comment that asked for code at head now gets a `pr-comment` source, even when the PR body repeats the outcome. Reviews carry more quotes, and a small nit that changed code also qualifies. Bots, thanks, and approvals ask for no code, so they stay out.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- .agents/skills/comprehende/SKILL.md