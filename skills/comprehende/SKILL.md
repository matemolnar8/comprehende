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

Always invoke the published CLI with the pinned version. Run it **inside** the repository under review so cwd is that repo.

```sh
npx comprehende@0.1.0 <command>
```

Do not use a git checkout path, `pnpm dev`, or an unpinned install.

## Workflow

1. Resolve the git range. Three-dot (`base...head`) is the merge-request / branch diff. Use the refs the user named. If the change is already on the default branch, use the request's base/head SHAs (or the merge-base), not current default-branch `HEAD`. Fetch if the refs are missing from the local clone.
2. Run `npx comprehende@0.1.0 index [--base <ref>] [--head <ref>]` and keep the JSON. This is the catalog of hunk refs (path + `@@` ranges) and skipped binaries. It contains **no line content**. Do not write the index into the work tree.
3. Read the change with git in that cwd (`git diff --stat <base>...<head>`, then the diffs). Group by **review concern**. Index is not enough to group.
4. Create a temporary directory **outside** the repository, then write `review.json` there by **copying hunk objects** from the index into groups. Set `size` from review burden, not from `git diff --stat`. Do not reconstruct `oldStart` / `newStart` from memory. Do not paste patch text. Do not write this file into the work tree. Do not add gitignore entries. Pass the **absolute** path to `--data`.

   Create the directory with the OS temp tools:
   - macOS / Linux: `mktemp -d` (or a unique name under `$TMPDIR` / `/tmp`)
   - Windows: a unique folder under `%TEMP%` (cmd) or `[System.IO.Path]::GetTempPath()` (PowerShell)
   - Node (any OS): `fs.mkdtempSync(path.join(os.tmpdir(), "comprehende-"))`

   Unix example:

   ```sh
   REVIEW_DIR=$(mktemp -d)
   # write $REVIEW_DIR/review.json
   ```

5. Run `npx comprehende@0.1.0 validate --data "$REVIEW_DIR/review.json"`. On failure, fix groups or coverage — never the diff.
6. Run `npx comprehende@0.1.0 serve --data "$REVIEW_DIR/review.json" --open` and give the user the localhost URL (`127.0.0.1` only).

Default `--head` is `HEAD`. Default `--base` is `origin/HEAD` (fallback `main` / `master`).

Tickets (`id`, optional `url` / `title`) may be copied from whatever tracker the user mentioned. Host CLIs are never required.

## Grouping rules

- Group by **review concern**, not by directory, unless the concern *is* a layer (schema, CLI, UI).
- The same hunk may appear in multiple groups when it matters in more than one story.
- `dependsOn` is a real dependency: the reader needs the earlier layer to understand this one. Use it only inside the same story. Reading order inside a story: contracts / foundations first, then call sites, then tests.
- Do not chain unrelated concerns with `dependsOn` just to force a reading order. Independent work — a second feature, a chore that does not hang on the main change, a drive-by that could have been its own PR — is its own group with no `dependsOn`, and no other group depends on it.
- Give each independent story a short `part` name. A few words, not a sentence. Put the same `part` on every layer in that story. Independent work gets its own `part`. The UI colors layers that share a `part` together.
- If you are not sure two concerns depend on each other, leave `dependsOn` empty and give them different `part` names. A false split is easy to see. A false chain hides a mixed PR.
- Use `suggestedOrder` for the walk through the whole review, including independent parts.
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
- Do not write `review.json` or the index dump into the repository under review. Use a temp directory.
- Opening a review whose `source` refs do not resolve in cwd is a user error; the CLI must refuse.
- The UI is a projector. The browser never computes diffs.
