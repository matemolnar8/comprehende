Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 70643aaa2b9b3ff4c4c60817e43b88d10525ab22` and `git rev-parse --verify bf56c7854460a614f644c2fbc7598a37f0878b45` in this repository.
   Done when both objects exist.

2. Choose the relevant review concerns.
   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.
   Done when every concern the question touches has its markdown loaded.

3. Answer from live git.
   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.
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

Commits:
- bf56c78 Make the skill fetch sources itself and run on any forge

Sources:
- transcript Claude Code session · Oct 25 Make the skill independent of this repo's setup and of any git forge. The agent fetches the sources; the user names only the change.
- commit Make the skill fetch sources itself and run on any forge The agent reads the request and comments through the forge CLI picked from the remote URL. Refresh uses Node instead of curl and jq.

The title:

Make the skill fetch sources itself and run on any forge

The why:

The skill runs installed on users' machines, with no Comprehende checkout and on any git forge, so [its text must not assume this repo's eval layout or GitHub](source:s1).

The what (small):

The skill's step-2 call fetches the request body and review comments through the forge CLI the remote URL names, the Refresh copy uses Node in place of curl and jq, and the PR-comment pin rule maps any forge's fields. The `.agents` copy is regenerated.

Look for:
- Subtle. The eval producer prompt in `scripts/eval/producer.ts` still tells the agent that sources are files on disk. That prompt overrides the forge fetch during an eval run, so eval cases keep working without a change to this diff.

## Review concerns

### 01 Agent fetches the sources (`sources`)

The step-2 block in `SKILL.md` replaces the `<sourcesDir>` loop with two placeholder fetch lines piped through `head -c 10000`, the paragraph below it says the remote URL names the forge CLI, and `powershell.md` mirrors the two fetches with `Out-String`.

[groups/sources.md](groups/sources.md)

### 02 Refresh copy uses Node (`refresh-node`)

The POSIX Refresh copy in `SKILL.md` runs the same Node one-liner `powershell.md` already used, and `powershell.md` drops the sentence that contrasted it with curl and jq.

[groups/refresh-node.md](groups/refresh-node.md)

### 03 Pin fields on any forge (`pin-mapping`)

The PR-comments bullet in `SKILL.md` gains one sentence that asks the agent to map each forge's own fields onto `side`, `line`, open, and outdated, and keeps the GitHub names as the example.

[groups/pin-mapping.md](groups/pin-mapping.md)

### 04 Regenerated .agents copy (`generated-copy`)

Both files under `.agents/skills/comprehende` repeat the `skills-next` hunks byte for byte, so the reader can skip them.

[groups/generated-copy.md](groups/generated-copy.md)