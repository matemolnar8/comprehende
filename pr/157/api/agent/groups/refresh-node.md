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

Review concern 02 of 04: Refresh copy uses Node (`refresh-node`)

The why:

[The compatibility line promises Node, git, and a shell](source:s2); the POSIX Refresh block also needed `jq`.

The what:

The POSIX Refresh copy in `SKILL.md` runs the same Node one-liner `powershell.md` already used, and `powershell.md` drops the sentence that contrasted it with curl and jq.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md@112+113
- skills-next/comprehende/references/powershell.md@45+43