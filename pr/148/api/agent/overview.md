Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 64c573619923b163e1bb2313bab69384ff71083e` and `git rev-parse --verify 2d9a15698520f1b0a1bf05f254910dd7c5249250` in this repository.
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

base (merge-base)  64c573619923b163e1bb2313bab69384ff71083e

head               2d9a15698520f1b0a1bf05f254910dd7c5249250

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 64c573619923b163e1bb2313bab69384ff71083e 2d9a15698520f1b0a1bf05f254910dd7c5249250

Commits:
- 2d9a156 Move developer docs out of the README

The title:

Move developer docs out of the README

The why:

npm shows the README on the package page. It had development, release, and Pages hosting notes that package users do not need.

The what (small):

The README now has only install, use, why, and a CLI table. The develop, serve and export, refresh, release, and fixture notes move to a new `CONTRIBUTING.md`. `AGENTS.md` points release work at the new file. All moved text is rewritten in plain words.

Look for:
- The README no longer says how `refresh` matches hunks. That text is now in `CONTRIBUTING.md` only.
- The Develop notes drop the old `npx comprehende@0.8.0` example and keep only the `node dist/cli/main.js` way to run a checkout on another repo.

## Review concerns

### 01 User-facing README (`readme`)

Short intro, install with the Node.js 24+ and git requirement, a Use section that says to run `/comprehende`, a shorter Why, and a table of CLI commands.

[groups/readme.md](groups/readme.md)

### 02 Developer notes in CONTRIBUTING.md (`contributing`)

Develop, Serve and export, Refresh, Release, and Fixture sections. The content matches the old README sections, with refresh rules as a list and Pages setup as one path.

Depends on:
- 01 User-facing README (`readme`)

[groups/contributing.md](groups/contributing.md)

### 03 Agent instructions point to CONTRIBUTING.md (`agents`)

The Release link now targets `CONTRIBUTING.md`. The Documentation rule says npm shows the README, and that development, release, and internal notes go in `CONTRIBUTING.md`.

Depends on:
- 02 Developer notes in CONTRIBUTING.md (`contributing`)

[groups/agents.md](groups/agents.md)