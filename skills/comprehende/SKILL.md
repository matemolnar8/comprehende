---
name: comprehende
description: Groups a git diff into review concerns and opens a local UI so humans can comprehend AI-generated code changes. Use when reviewing a PR, a branch diff, a turn diff, or when the user asks to run comprehende.
license: MIT
compatibility: Requires Node.js 24+, git, and a git work tree as the current working directory.
---

# Comprehende

Local review assistant. Always run the CLI **inside** the repository under review. Cwd is the repo. There is no `--repo` flag.

## Purpose

AI agents write a lot of code. That creates **comprehension debt**: the gap between what is in the repo and what humans actually understand. Unlike technical debt, nobody chooses it, and it stays invisible until something breaks.

- **Cognitive offloading**: hand off the *how*, keep the *what*. The human still has a view of the change.
- **Cognitive surrender**: adopt the agent's answer with no view of your own. That is how the debt grows.

This skill is for offloading, not surrender. Group and summarize so a human can form their own view, then drill into the live git diff. Do not rubber-stamp. Do not hide risk behind file lists.

The review document is interpretation only: groups, summaries, hunk pointers. **Never** copy patch text, file bodies, or blame into `review.json`. Diffs are live `git` output at serve time. If git and the document disagree, git wins — fix groups, never invent a replacement hunk.

## Resolve the CLI

Prefer a built binary so cwd stays the repo under review:

```sh
node /path/to/comprehende/dist/cli/main.js <command>
```

During development of this checkout, `pnpm dev -- <command>` is only valid when this repo is the one being reviewed.

If the package is linked globally (`pnpm link --global` from the comprehende checkout), `comprehende` works from any cwd.

## Workflow

1. Resolve the git range. Three-dot (`base...head`) is the merge-request / branch diff. Use the refs the user named. If the change is already on the default branch, use the request's base/head SHAs (or the merge-base), not current default-branch `HEAD`. Fetch if the refs are missing from the local clone.
2. Run `comprehende index [--base <ref>] [--head <ref>]` and save the JSON. This is the catalog of hunk refs (path + `@@` ranges) and skipped binaries. It contains **no line content**.
3. Read the change with git in that cwd (`git diff --stat <base>...<head>`, then the diffs). Group by **review concern**. Index is not enough to group.
4. Write `review.json` by **copying hunk objects** from the index into groups. Set `size` from review burden, not from `git diff --stat`. Do not reconstruct `oldStart` / `newStart` from memory. Do not paste patch text.
5. Run `comprehende validate --data review.json`. On failure, fix groups or coverage — never the diff.
6. Run `comprehende serve --data review.json --open` and give the user the localhost URL (`127.0.0.1` only).

Default `--head` is `HEAD`. Default `--base` is `origin/HEAD` (fallback `main` / `master`).

Tickets (`id`, optional `url` / `title`) may be copied from whatever tracker the user mentioned. Host CLIs are never required.

## Grouping rules

- Group by **review concern**, not by directory, unless the concern *is* a layer (schema, CLI, UI).
- The same hunk may appear in multiple groups when it matters in more than one story.
- Reading order: contracts / foundations first, then call sites, then tests, then chores. Encode that with `dependsOn` (earlier layer ids).
- `summary` is **one sentence**: what this layer is, so a human can keep the *what*. `lookFor` is a short bullet list of what to inspect before accepting. Do not pack commits, file lists, and hunk counts into a single paragraph.
- The UI also has an **Overview** of the stack. Optional document `walkthrough` is one or two sentences for the whole change (commit subjects are fine). Do not paraphrase the patch.
- Set document `size` to the **human review burden**, not file or hunk count: `trivial`, `small`, `medium`, `large`, `very-large`. Forty files that only change an import in one layer are `small`. Three files that rewrite a contract the rest of the stack hangs on can be `large`.
- Coverage: every hunk from `index` must appear in ≥1 group. Duplicate refs across groups are allowed. Unreferenced hunks fail `validate` and show up as **Unassigned** in the UI.
- Stale refs (rebase, edited working tree) fail `validate`. `serve` still starts, shows live git, and flags the broken pointer. Do not invent a replacement hunk.

Hunk identity is `(path, oldStart, newStart)` plus `oldPath` when renamed. Copy `oldStart` / `oldLines` / `newStart` / `newLines` from the index. Do not guess numbers from memory.

Schema: [references/review.schema.json](./references/review.schema.json). Example document: [references/example.md](./references/example.md).

## Accuracy

- Do not generate, clean up, or rewrite diffs.
- Do not snapshot the repo into the data layer.
- Opening a review whose `source` refs do not resolve in cwd is a user error; the CLI must refuse.
- The UI is a projector. The browser never computes diffs.
