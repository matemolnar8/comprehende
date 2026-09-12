Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify c7978bdc875cecaa6e396c724e48bac751b1e10b` and `git rev-parse --verify 16565def6a52a638a09689dc5f6ddfe45cab1504` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  c7978bdc875cecaa6e396c724e48bac751b1e10b

head               16565def6a52a638a09689dc5f6ddfe45cab1504

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames c7978bdc875cecaa6e396c724e48bac751b1e10b 16565def6a52a638a09689dc5f6ddfe45cab1504

Commits:
- 16565de Publish PR reviews to GitHub Pages instead of VibeDrop

Sources:
- transcript Cursor session · Sep 12 Switch PR reports from VibeDrop to GitHub Pages. Remove VibeDrop references. Orphan old reports when a PR closes or after a TTL.
- pr PR #67 Export stays a static site. This repo publishes it to GitHub Pages at pr/<n>/. Pages must be enabled once. Close and a 30-day TTL remove old reviews.
  https://github.com/matemolnar8/comprehende/pull/67
- commit 16565de Commit message names GitHub Pages at pr/<n>/, close cleanup, and a 30-day TTL.

The title:

Publish PR reviews to GitHub Pages

The why:

The [Cursor session](source:s1) asked to drop VibeDrop, publish reviews on GitHub Pages, and remove old reports when a PR closes or after a TTL. [PR #67](source:s2) records that same setup.

The what (medium):

`scripts/pages-review.ts` pushes a static export to `gh-pages` at `pr/<n>/`. A workflow deletes that folder on PR close and after 30 days. The skill, AGENTS.md, and README tell agents to use it, and the VibeDrop skill is gone.

Look for:
- [PR #67](source:s2) says Pages is not on yet. No hunk calls the GitHub Pages API, so the published URL 404s until Settings uses branch `gh-pages`.
- The [session](source:s1) asked for orphaning on close or a TTL. The workflow does both: closed PRs run `--pr`, and a daily cron runs `--ttl-days 30`.

## Review concerns

### 01 pages-review publish and prune (`publish`)

`scripts/pages-review.ts` copies an export to `pr/<n>/` on `gh-pages`, writes `.nojekyll` and an index, and deletes folders by PR number or `published.json` age.

[groups/publish.md](groups/publish.md)

### 02 pages-review tests (`tests`)

`scripts/pages-review.test.ts` drives a local bare remote through publish and prune. `package.json` includes `scripts/**/*.test.ts` in `pnpm test`.

Depends on:
- 01 pages-review publish and prune (`publish`)

[groups/tests.md](groups/tests.md)

### 03 Pages prune workflow (`workflow`)

`.github/workflows/pages-reviews.yml` runs `pages-review.ts prune --pr` on close, and `prune --ttl-days 30` on a daily cron.

Depends on:
- 01 pages-review publish and prune (`publish`)

[groups/workflow.md](groups/workflow.md)

### 04 Agent and README instructions (`instructions`)

AGENTS.md, README, and both skill copies tell agents to run `pages-review.ts publish` and to put the GitHub Pages URL in the PR body.

Depends on:
- 01 pages-review publish and prune (`publish`)

[groups/instructions.md](groups/instructions.md)

### 05 Remove the VibeDrop skill (`drop-vibedrop`)

Deletes `.agents/skills/vibedrop/SKILL.md`.

[groups/drop-vibedrop.md](groups/drop-vibedrop.md)