Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify edf8493d0359215e44fbe8b801c108ca61c609a2` and `git rev-parse --verify 7916fd39239ca52f88e28f63adb77d7f4901a955` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames edf8493d0359215e44fbe8b801c108ca61c609a2 7916fd39239ca52f88e28f63adb77d7f4901a955 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  edf8493d0359215e44fbe8b801c108ca61c609a2

head               7916fd39239ca52f88e28f63adb77d7f4901a955

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames edf8493d0359215e44fbe8b801c108ca61c609a2 7916fd39239ca52f88e28f63adb77d7f4901a955

Review concern 06 of 08: Skill rule, example, and glossary (`skill`)

The why:

[#162](source:s1) proposes the rule: ask why when the code and the sources leave the reason open, and put a source's answer in `why`.

The what:

A new Questions section in `skills-next/comprehende/SKILL.md` states the rule, steps 4 and Refresh 4 use it, `example.md` adds the issue's two questions, and the glossary defines Questions; the `.agents/` copies are the `sync:skill` output of the same text.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md
- .agents/skills/comprehende/SKILL.md
- skills-next/comprehende/references/example.md
- .agents/skills/comprehende/references/example.md
- docs/glossary.md