Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 70643aaa2b9b3ff4c4c60817e43b88d10525ab22` and `git rev-parse --verify bf56c7854460a614f644c2fbc7598a37f0878b45` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 70643aaa2b9b3ff4c4c60817e43b88d10525ab22 bf56c7854460a614f644c2fbc7598a37f0878b45 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  70643aaa2b9b3ff4c4c60817e43b88d10525ab22

head               bf56c7854460a614f644c2fbc7598a37f0878b45

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 70643aaa2b9b3ff4c4c60817e43b88d10525ab22 bf56c7854460a614f644c2fbc7598a37f0878b45

Review concern 01 of 04: Agent fetches the sources (`sources`)

The why:

[The user names only the change; the agent must get the request body and comments itself](source:s1), on whatever forge the repository uses.

The what:

The step-2 block in `SKILL.md` replaces the `<sourcesDir>` loop with two placeholder fetch lines piped through `head -c 10000`, the paragraph below it says the remote URL names the forge CLI, and `powershell.md` mirrors the two fetches with `Out-String`.

Look for:
- The two fetch lines are placeholders inside a code block. The agent substitutes the forge CLI command, so a harness without a forge CLI or MCP has no source other than the commit log.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md@37+37
- skills-next/comprehende/references/powershell.md@22+22