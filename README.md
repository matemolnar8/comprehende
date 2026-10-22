# Comprehende

[![npm](https://img.shields.io/npm/v/comprehende)](https://www.npmjs.com/package/comprehende)

Comprehende groups a git diff by review concern and shows the groups in a local web UI. Your coding agent writes the summaries. The diff always comes from git in your repository, never from the model, and the review file never stores it.

## Install

```sh
npx skills add matemolnar8/comprehende
```

Requires Node.js 24+ and git.

## Use

Inside the repository you want to review, run `/comprehende` in your coding agent. Name what to review: a pull request, a branch, or the changes from the last turn. The agent writes a review file and prints a local URL for the UI.

When the branch gets new commits, run it again. The agent keeps the existing groups and rewrites only the ones that changed.

## Why

AI coding agents write more code than we can read line by line. Three ideas explain the risk.

Cognitive offloading means you give a tool the _how_ and keep the _why_ and the _what_. A calculator adds two numbers, but you chose the numbers and you know why you need the sum.

Cognitive surrender means you stop forming your own answer and take the tool's answer, with nothing of your own to compare it to. The calculator picks the numbers too, and you accept the result.

Comprehension debt is the gap between the code in a system and how much of it its developers and operators understand. It is like technical debt with two differences. Nobody chooses to take it on, and nobody sees it. The tests pass and the code looks clean, so nobody knows where the debt is until something breaks.

Each time we accept agent code without reading it, we surrender and the debt grows. It comes due at the worst time, during an incident or a long debug session.

Comprehende moves review from surrender back to offloading. You keep the speed of the agents and still understand what they changed.

## CLI

The skill runs these commands for you. Run them inside the repository under review.

| Command                                                          | What it does                                                                                                                             |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `comprehende review [--base <ref>] [--head <ref>] --data <file>` | Writes a review skeleton for `base...head` with one entry per changed file. The base defaults to `origin/HEAD`, then `main` or `master`. |
| `comprehende digest --base <ref> --head <ref>`                   | Prints one line per changed file: kind, hunks, and symbols.                                                                              |
| `comprehende show --hunk <path@oldStart+newStart>`               | Prints the patch for one hunk or file.                                                                                                   |
| `comprehende pregroup --base <ref> --head <ref> --data <file>`   | Writes a draft review that already groups identical copies and mechanical files.                                                         |
| `comprehende validate --data <file>`                             | Checks that every hunk ref points into live git and that every hunk is in a group.                                                       |
| `comprehende serve --data <file>`                                | Serves the UI on a local URL.                                                                                                            |
| `comprehende export --data <file> --out <dir>`                   | Writes a static copy of the UI that any static file server can host.                                                                     |
| `comprehende refresh --data <file>`                              | Moves a review to new commits. Keeps unchanged hunks in their groups and puts new hunks in a draft group.                                |

The URL hash holds the UI location, so a shared link opens the same view in `serve` and `export`. After `refresh`, the What changed page (`#changes`, or `h`) compares the review with the old one.
