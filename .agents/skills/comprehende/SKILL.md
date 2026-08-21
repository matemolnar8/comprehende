---
name: comprehende
description: Groups a git diff into review concerns and opens a local UI so humans can comprehend AI-generated code changes. Use when reviewing a PR, a branch diff, a turn diff, or when the user asks to run comprehende.
license: MIT
compatibility: Requires Node.js 24+, git, and a git work tree as the current working directory.
---

# Comprehende

Local review assistant. Always run the CLI inside the repository under review. Cwd is the repo. There is no `--repo` flag.

## Purpose

AI agents write a lot of code. That creates comprehension debt: the gap between what is in the repo and what humans actually understand. Unlike technical debt, nobody chooses it. It stays invisible until something breaks.

Cognitive offloading means handing off the *how* while keeping the *why* and the *what*. The human still has a view of the change. Cognitive surrender means adopting the agent's answer with no *why* or *what* of your own. That is how the debt grows.

This skill is for offloading. Group and summarize so a human can form their own view, then drill into the live git diff. Do not rubber-stamp. Do not hide risk behind file lists.

The review document is interpretation only: groups, summaries, hunk pointers. Never copy patch text, file bodies, or blame into `review.json`. Diffs are live `git` output at serve time. If git and the document disagree, git wins. Fix groups. Never invent a replacement hunk.

## Resolve the CLI

Run the published CLI at the pinned version, inside the repository under review.

```sh
npx comprehende@0.3.0 <command>
```

Do not use a git checkout path, `pnpm dev`, or an unpinned install.

## Workflow

1. Resolve the git range. Three-dot (`base...head`) is the merge-request / branch diff. Use the refs the user named. If the change is already on the default branch, use the request's base and head SHAs, or the merge-base. Do not use current default-branch `HEAD`. Fetch if the refs are missing from the local clone.
2. Run `npx comprehende@0.3.0 index [--base <ref>] [--head <ref>]` and keep the JSON. This lists hunk refs (path plus `@@` ranges), image files, and skipped non-image binaries. Image files use `oldStart`/`newStart` 0. It contains no line content and no image bytes. Do not write the index into the work tree.
3. Recover the why and write the what. Copy tickets from the request. Read commit subjects and bodies with `git log --format='%s%n%n%b' --end-of-options <base>...<head>`. If you have a coding-agent transcript for this change, read the human's stated reason. Do not copy commit text or the transcript into `review.json`. Then read `git diff --stat <base>...<head>` and the diffs. Group by review concern. Write a document `summary` for the whole change. Write a `why` on each layer, and a document `why` only when a ticket, issue, or transcript names a motive for the whole change. Index is not enough to group. Log is not enough to group.
4. Create a temporary directory outside the repository. Write `review.json` there. Copy hunk objects from the index into groups. Set `size` from review burden, not from `git diff --stat`. Do not reconstruct `oldStart` / `newStart` from memory. Do not paste patch text. Do not write this file into the work tree. Do not add gitignore entries. Pass the absolute path to `--data`.

   Create the directory with the OS temp tools:
   - macOS / Linux: `mktemp -d` (or a unique name under `$TMPDIR` / `/tmp`)
   - Windows: a unique folder under `%TEMP%` (cmd) or `[System.IO.Path]::GetTempPath()` (PowerShell)
   - Node (any OS): `fs.mkdtempSync(path.join(os.tmpdir(), "comprehende-"))`

   Unix example:

   ```sh
   REVIEW_DIR=$(mktemp -d)
   # write $REVIEW_DIR/review.json
   ```

5. Run `npx comprehende@0.3.0 validate --data "$REVIEW_DIR/review.json"`. On failure, fix groups or coverage. Never the diff.
6. Run `npx comprehende@0.3.0 serve --data "$REVIEW_DIR/review.json" --open` and give the user the localhost URL (`127.0.0.1` only).

Default `--head` is `HEAD`. Default `--base` is `origin/HEAD`, falling back to `main` or `master`.

## The why

Write the why. Tickets, issues, and coding-agent transcripts are sources for Overview Why. They are not the Overview text. Commit messages inform each layer, and can support a document `why` when a ticket or transcript is also present. Commits alone are not enough for Overview Why.

Tickets. Copy `id`, and optional `url` / `title` / `part`, from the tracker the user named. Host CLIs are never required. If `url` is present, linking is enough. Do not fetch issue bodies.

Commit messages. Read `git log` for `base...head`. Serve reads subjects and bodies from live git. Do not copy them into `review.json`.

Transcripts. If this change was written in a coding-agent session and you have that transcript, use the human's stated reason. Use a transcript you already have: this session, or a log the user named. Do not call a vendor API to fetch one. Do not paste the transcript into `review.json`. Do not copy the agent's plan, tool trace, or a recap of the diff.

Document `why` is one or two sentences for the whole change. Write it from tickets, issues, or a transcript. Do not paraphrase hunks. If those sources are silent, omit `why`. If independent stories have different motives, omit `why`. Do not smash them into one sentence. The UI skips the Why section when `why` is absent. Do not write a substitute.

Each layer has `why`. Write why this layer exists. If a source names this layer's concern, use that. If this layer has no ticket, commit, or transcript of its own, it is enough to say it enables the layers that depend on it, or that later layers in the story need this foundation. Do not invent a product motive from the patch.

Every layer still needs a `why`, including layers that only exist to enable later ones.

Overview shows Why only when document `why` is present. Each layer shows its `why` before the what and the live git diff. Put `part` on each ticket that belongs to one story, using the same name as that story's layers.

## The what

Something always happened. Write document `summary` for every review. One or two sentences. Name what this change is, including independent stories when the PR is mixed. This is the Overview What. It is not a motive. Do not leave it out.

Layer `summary` stays one sentence that says what this layer is.

## Grouping rules

- Group by review concern, not by directory, unless the concern is a layer (schema, CLI, UI).
- The same hunk may appear in multiple groups when it matters in more than one story.
- `dependsOn` is a real dependency: the reader needs the earlier layer to understand this one. Use it only inside the same story. Reading order inside a story: contracts and foundations first, then call sites, then tests.
- Do not chain unrelated concerns with `dependsOn` just to force a reading order. Independent work is its own group with no `dependsOn`, and no other group depends on it. A second feature, or a drive-by that could have been its own PR, is independent work.
- Give each independent story a short `part` name. A few words, not a sentence. Put the same `part` on every layer in that story. Independent work gets its own `part`. The UI colors layers that share a `part` together.
- If you are not sure two concerns depend on each other, leave `dependsOn` empty and give them different `part` names. A false split is easy to see. A false chain hides a mixed PR.
- Use `suggestedOrder` for the walk through the whole review, including independent parts.
- `summary` is one sentence that says what this layer is, so a human can keep the *what*. Document `summary` is one or two sentences for the whole change. `lookFor` is a short bullet list of what to inspect before accepting. Do not pack commits, file lists, and hunk counts into a single paragraph.
- Overview is Why then What. Document `why` is optional. Skip the Why section when it is absent. Document `summary` is the what for the whole change and is always present. Each layer `why` is the why for that layer. Layer titles and summaries are the what of that layer. The live git diff is the how. Do not paraphrase the patch as why.
- Set document `size` to the human review burden, not file or hunk count: `trivial`, `small`, `medium`, `large`, `very-large`. Forty files that only change an import in one layer are `small`. Three files that rewrite a contract the rest of the stack hangs on can be `large`.
- Every hunk from `index` must appear in at least one group. Duplicate refs across groups are allowed. Unreferenced hunks fail `validate` and show up as Unassigned in the UI.
- Stale refs (rebase, edited working tree) fail `validate`. `serve` still starts, shows live git, and flags the broken pointer. Do not invent a replacement hunk.

Hunk identity is `(path, oldStart, newStart)` plus `oldPath` when renamed. Copy `oldStart` / `oldLines` / `newStart` / `newLines` from the index. Do not guess numbers from memory. Image files are hunks too — copy those refs into groups. Other binaries stay in `skipped`. Git LFS images are read from `.git/lfs/objects` in the clone. If the object is missing, the image slot is empty. Do not paste image bytes into `review.json`.

Schema: [references/review.schema.json](./references/review.schema.json). Example document: [references/example.md](./references/example.md).

## Accuracy

- Do not generate, clean up, or rewrite diffs.
- Do not invent the why from the patch. Write it from tickets, issues, coding-agent transcripts, or from how the layers depend on each other. If those sources are silent, omit document `why`. Always write document `summary`.
- Do not snapshot the repo into `review.json`.
- Do not write `review.json` or the index dump into the repository under review. Use a temp directory.
- Opening a review whose `source` refs do not resolve in cwd is a user error. The CLI must refuse.
- The UI only displays git output. The browser never computes diffs.
