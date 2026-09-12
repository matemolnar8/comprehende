---
name: pages
description: Host a static site on this repo's GitHub Pages. Use when uploading a folder with index.html, including a comprehende export, or when a pull request needs a hosted review URL.
---

# Pages

Copy a static site onto this repository's `gh-pages` branch so it has a public URL.

## Host

1. Confirm the folder contains `index.html`. Done when that file is present. If it is missing, use the built site (a comprehende `export` out dir).
2. Resolve the pull request number: the one they named, or `gh pr view --json number` for this branch. Done when you have a positive integer. If there is no pull request, stop and tell them.
3. From this comprehende checkout, run `pnpm exec tsx scripts/pages-review.ts publish --dir <folder> --pr <n>`. `--dir` may live outside the work tree. Other flags: `pnpm exec tsx scripts/pages-review.ts --help`. Done when the command prints a URL.
4. Give them that URL.

A 404 at the URL means Pages is off. Enable once in the GitHub repo: Settings, Pages, Deploy from a branch, `gh-pages`, `/`. The publish already succeeded.
