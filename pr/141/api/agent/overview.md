Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify c257dfe063111589d735393ff0bfdaae47edfca4` and `git rev-parse --verify d5e53209456bcbbd4204c5e753e3c069b0215c5c` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende.git

base (merge-base)  c257dfe063111589d735393ff0bfdaae47edfca4

head               d5e53209456bcbbd4204c5e753e3c069b0215c5c

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames c257dfe063111589d735393ff0bfdaae47edfca4 d5e53209456bcbbd4204c5e753e3c069b0215c5c

Commits:
- d5e5320 Rework AGENTS.md with T3 ideas

Sources:
- transcript This session User likes the T3 Code AGENTS.md and asks to adopt its useful ideas in this repo.

The title:

Rework AGENTS.md with T3 ideas

The why:

The user likes the T3 Code AGENTS.md and wants the useful parts in this repo.

The what (small):

AGENTS.md keeps its Comprehende content and adopts the T3 structure: who-is-who, pipeline, file map, footguns, checklists, and verify and docs rules.

## Review concerns

### 01 AGENTS.md borrows the T3 shape (`agents-guide`)

AGENTS.md gains voice rules, work pipeline, directory map, footguns, done-checklist, verify rules, docs rules, and PR guardrails, all in the T3 shape.

[groups/agents-guide.md](groups/agents-guide.md)