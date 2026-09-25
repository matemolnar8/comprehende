# comprehende-67: Publish PR reviews to GitHub Pages

PR #67. No ticket. A Bugbot comment (fixed) and a conversation about the 404.

## Story

- Title: the PR title.
- Why: present, from the PR. PR reviews move from VibeDrop to this repo's GitHub Pages.
- Size: medium.
- Parts: one story. Groups: 3 to 4.

## Groups

1. Publish and prune script: `scripts/pages-review.ts`, `scripts/pages-review.test.ts`, the `test` glob in `package.json`.
2. Prune workflow: `.github/workflows/pages-reviews.yml`.
3. Agent flow: `.agents/skills/pages/SKILL.md`, the deleted `.agents/skills/vibedrop/SKILL.md`, `AGENTS.md`.
4. `README.md`. This can merge with group 3.

## Must state

- A rejected push now resets to the remote `gh-pages` tip and applies the review again. Rebase is gone, so a conflict on the root `index.html` no longer uses up the retries. This is the Bugbot fix.
- The hosted URL returns 404 until GitHub Pages is turned on for the `gh-pages` branch. That is a one-time step in the repo settings.

## Good to state

- A site folder without `published.json` counts as published in 1970. The next daily prune deletes it.
- The comprehende skill does not change. Publishing stays in this repo (commit `9db4afb`).
- The README paragraph describes how this repo hosts reviews, not tool behavior. `AGENTS.md` says the README is for people who use the tool.

## Must not

- Do not claim the comprehende skill publishes to Pages.
- Do not make separate groups for the tests or for the `package.json` test glob.

## Baseline

- 6 of 6 runs stated both claims.
- 0 of 6 noted the 1970 rule.
- Runs made 4 to 6 groups. 3 of 6 gave the test glob its own group, and 6 of 6 gave the tests their own group.

## case.json

- `parts` max 3 to 2.
- `together`: the script and its test.
- Clarified the retry claim.
