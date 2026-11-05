---
name: pages
description: Host a static site on this repo's GitHub Pages. Use when uploading a folder with index.html, including a comprehende export, or when a pull request needs a hosted review URL.
---

# Pages

Copy a static site onto this repository's `gh-pages` branch so it has a public URL.

## Host

1. Confirm the folder contains `index.html`. Done when that file is present. If it is missing, use the built site (a comprehende `export` out dir). For a pull request, put its screenshots inside that folder (for example `shots/`), so they land at `pr/<n>/shots/` with the same publish.
2. Pick dest. A pull request they named, or `gh pr view --json number` when hosting that review, uses `--pr`. Anything else uses `--name` with a lowercase slug they named, or one you make. Done when you have exactly one of `--pr` or `--name`.
3. From this comprehende checkout, run `pnpm exec tsx scripts/pages-review.ts publish --dir <folder>` with that dest. `--dir` may live outside the work tree. It prints the URL, waits for the `pages-build-deployment` run of the pushed `gh-pages` commit, reruns it once if it fails, and prints a `deploy <state>` line. Other flags: `pnpm exec tsx scripts/pages-review.ts --help`. Done when the command exits.
4. Give them the URL and the deploy state.

Publish once per pull request: one folder with the review and its screenshots. Each publish starts a deploy, and a second deploy that starts while the first still runs fails with "in progress deployment".

A 404 right after publish means the deploy is still running or failed; the `deploy` line says which. When it ends `failure` or `running` (a lock that outlasts the rerun), run `gh api -X POST repos/<owner>/<repo>/pages/builds` in the background every few minutes until a `pages build and deployment` run for that `gh-pages` commit succeeds, then report once. This does not need the user. `deploy missing` means Pages is off: the user enables it once in Settings, Pages, Deploy from a branch, `gh-pages`, `/`.
