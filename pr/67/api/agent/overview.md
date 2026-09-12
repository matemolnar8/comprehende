Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify c7978bdc875cecaa6e396c724e48bac751b1e10b` and `git rev-parse --verify 62f46c7abf557d7bc177a15e400d8f9861e35bd1` in this repository.
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

head               62f46c7abf557d7bc177a15e400d8f9861e35bd1

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames c7978bdc875cecaa6e396c724e48bac751b1e10b 62f46c7abf557d7bc177a15e400d8f9861e35bd1

Commits:
- 62f46c7 Support named GitHub Pages uploads without a pull request
- f65da81 Add a pages skill to host static sites on GitHub Pages
- 9db4afb Keep GitHub Pages publish out of the comprehende skill
- d6ec9ee Replay Pages publishes onto gh-pages instead of rebasing
- 16565de Publish PR reviews to GitHub Pages instead of VibeDrop

Sources:
- pr PR #67 Hosts export folders on this repo's GitHub Pages at pr/<n>/ or site/<name>/, and drops them on close or after 30 days.
  https://github.com/matemolnar8/comprehende/pull/67
- pr-comment matemolnar8 on PR #67 The published review URL returns Site not found.
  https://github.com/matemolnar8/comprehende/pull/67#issuecomment-5648282947
- pr-comment cursor[bot] on PR #67 Concurrent publishes conflict on index.html. rebase with allowFail swallows the conflict, so retries never push.
  https://github.com/matemolnar8/comprehende/pull/67#discussion_r3996639675
- pr-comment cursor[bot] on PR #67 A rejected push now resets to remote gh-pages and re-applies, then rebuilds the listing from published.json.
  https://github.com/matemolnar8/comprehende/pull/67#discussion_r3997365611
- transcript Cursor session · Sep 12 Asked to host with a separate pages skill, like VibeDrop, including named uploads that are not pull requests.
- pr-comment cursor[bot] on PR #67 Pages is still off for the repo, so the URL 404s until Settings enables the gh-pages branch.
  https://github.com/matemolnar8/comprehende/pull/67#issuecomment-5648305695

The title:

Publish PR reviews to GitHub Pages

The why:

[PR #67](source:s1) hosts comprehende exports on this repo's GitHub Pages instead of VibeDrop. [The session](source:s5) wants a pages skill that can upload a static site at any point, including without a pull request.

The what (medium):

`scripts/pages-review.ts` and the pages skill copy a static folder onto `gh-pages` at `pr/<n>/` or `site/<name>/`. A workflow removes a PR folder on close and drops sites older than 30 days.

Look for:
- [Mate](source:s2) reports https://matemolnar8.github.io/comprehende/pr/67/ is Site not found. No hunk enables GitHub Pages in repo Settings.

## Review concerns

### 01 Pages publish CLI (`cli`)

`publish` and `prune` in `scripts/pages-review.ts` write `pr/<n>/` or `site/<slug>/` and rebuild the listing from `published.json` after a rejected push.

[groups/cli.md](groups/cli.md)

### 02 Close and TTL prune (`workflow`)

`.github/workflows/pages-reviews.yml` runs `prune --pr` on close and `prune --ttl-days 30` on a daily cron.

Depends on:
- 01 Pages publish CLI (`cli`)

[groups/workflow.md](groups/workflow.md)

### 03 Pages skill (`skill`)

The pages skill and `AGENTS.md` tell agents to host with the CLI, and `.agents/skills/vibedrop/SKILL.md` is deleted.

Depends on:
- 01 Pages publish CLI (`cli`)

[groups/skill.md](groups/skill.md)

### 04 Pages CLI tests (`tests`)

`scripts/pages-review.test.ts` covers publish, prune, named dests, and listing replay, and `package.json` includes it in `pnpm test`.

Depends on:
- 01 Pages publish CLI (`cli`)

[groups/tests.md](groups/tests.md)

### 05 Pages URLs in README (`readme`)

README Develop names the `pr/<number>/` and `site/<name>/` URLs, the one-time Pages enable, and the 30-day TTL.

Depends on:
- 01 Pages publish CLI (`cli`)

[groups/readme.md](groups/readme.md)