---
name: comprehende
description: Groups a git diff into review concerns and opens a local UI so humans can comprehend AI-generated code changes. Use when reviewing a PR, a branch diff, a turn diff, or when the user asks to run comprehende.
license: MIT
compatibility: Requires Node.js 24+, git, and a git work tree as the current working directory.
---

# Comprehende

Local review assistant. Always run the CLI inside the repository under review.

## Status

Skeleton. `index`, `validate`, and `serve` are not implemented yet.

## Intended workflow

1. Resolve the git range (PR, `main...HEAD`, or user-specified).
2. Run `comprehende index [--base <ref>] [--head <ref>]`.
3. Write `review.json` with groups, summaries, and hunk refs only. Never copy patch text or file contents into the document.
4. Run `comprehende validate --data review.json`. On failure, fix groups, never the diff.
5. Run `comprehende serve --data review.json` and give the user the localhost URL.

During local development of this repo, invoke the CLI with `pnpm exec comprehende` or `pnpm dev -- <command>` from the comprehende checkout, still with cwd set to the repo under review.
