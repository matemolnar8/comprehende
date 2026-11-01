Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify d6b0b7728aa0777132d7a1685f6d136672588918` and `git rev-parse --verify 4b52aa2199ca3264c2713d147a8b91baffe2898a` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames d6b0b7728aa0777132d7a1685f6d136672588918 4b52aa2199ca3264c2713d147a8b91baffe2898a -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  d6b0b7728aa0777132d7a1685f6d136672588918

head               4b52aa2199ca3264c2713d147a8b91baffe2898a

Named refs at pin: origin/main ... t3/skill-substeps

Read the diff:

git diff --find-renames d6b0b7728aa0777132d7a1685f6d136672588918 4b52aa2199ca3264c2713d147a8b91baffe2898a

Review concern 03 of 03: Generated skill copy (`generated`)

The why:

`pnpm sync:skill` copies the skill source into `.agents/skills/` for agents that work in this repo.

The what:

Each file under `.agents/skills/comprehende/` repeats its `skills-next/comprehende/` source byte for byte, so the reader can skip this group.

Hunk refs for this concern:
- .agents/skills/comprehende/SKILL.md
- .agents/skills/comprehende/references/export.md
- .agents/skills/comprehende/references/local-cli.md
- .agents/skills/comprehende/references/powershell.md
- .agents/skills/comprehende/references/refresh.md
- .agents/skills/comprehende/references/stacks.md