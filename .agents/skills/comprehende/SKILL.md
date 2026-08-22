---
name: comprehende
description: Groups a git diff into review concerns and opens a local UI so humans can comprehend AI-generated code changes. Use when reviewing a PR, a branch diff, a turn diff, or when the user asks to run comprehende.
license: MIT
compatibility: Requires Node.js 24+, git, and a git work tree as the current working directory.
---

# Comprehende

Local review assistant. Always run the CLI inside the repository under review. Cwd is the repo. There is no `--repo` flag.

## Purpose

AI agents write a lot of code. That creates comprehension debt, the gap between what is in the repo and what humans actually understand. Unlike technical debt, nobody chooses it. It stays invisible until something breaks.

Cognitive offloading means handing off the *how* while keeping the *why* and the *what*. The human still has a view of the change. Cognitive surrender means adopting the agent's answer with no *why* or *what* of your own. That is how the debt grows.

This skill is for offloading. Group and summarize so a human can form their own view, then read the live git diff. Do not accept the groups without reading the diff. Do not hide risk behind file lists.

The review document is interpretation only. It holds groups, summaries, and hunk pointers. The UI displays a group as a layer. Never copy patch text, file bodies, or blame into `review.json`. Diffs are live `git` output at serve time. If git and the document disagree, git wins. Fix groups. Never invent a replacement hunk.

## Resolve the CLI

Run the published CLI at the pinned version, inside the repository under review.

```sh
npx comprehende@0.4.1 <command>
```

Do not use an unpinned install.

## Workflow

1. Use the refs the user named. Three-dot (`base...head`) is the merge request or branch diff. If the change is already on the default branch, use the request's recorded base and head SHAs. If only the head SHA is available, use the merge-base of that head with the named base branch, then that head. Do not use current default-branch `HEAD`. Fetch if the refs are missing from the local clone.
2. Run `npx comprehende@0.4.1 index [--base <ref>] [--head <ref>]` and keep the JSON. Default `--head` is `HEAD`. Default `--base` is `origin/HEAD`, falling back to `main` or `master`. The JSON lists hunk refs (path plus `@@` ranges), image files, and skipped files. Image files use `oldStart` and `newStart` 0. Lockfiles and non-image binaries are in `skipped`. It contains no line content and no image bytes. Do not write the index into the work tree.
3. Recover the why and write the what.
   - Copy tickets from the request. If you have a host CLI or MCP, read the ticket or issue when you need it to write document `why`.
   - If the user named a pull request or merge request, read its description.
   - Read commit subjects and bodies with `git log --format='%s%n%n%b' --end-of-options <base>...<head>`.
   - If you have a coding-agent transcript for this change, read the human's stated reason.
   - Do not copy commit text, the request description, the issue body, or the transcript into `review.json`.
   - Read `git diff --stat <base>...<head>` and the diffs. The summaries must come from the code, not from the log.
   - Write a document `summary` for the whole change.
   - Write a document `why` when a ticket, issue, request description, or transcript names why this work exists.
4. Group the hunks by review concern. Follow the Grouping rules. Assign every hunk from the index to at least one group. Write a `why` on each group.
5. Create a temporary directory outside the repository. Write `review.json` there. Copy hunk objects from the index into groups. Set `size` from review burden, not from `git diff --stat`. Do not reconstruct `oldStart` or `newStart` from memory. Do not paste patch text. Do not write this file into the work tree. Do not add gitignore entries. Pass the absolute path to `--data`.

   Create the directory with the OS temp tools:
   - macOS or Linux: `mktemp -d` (or a unique name under `$TMPDIR` or `/tmp`)
   - Windows: a unique folder under `%TEMP%` (cmd) or `[System.IO.Path]::GetTempPath()` (PowerShell)
   - Node (any OS): `fs.mkdtempSync(path.join(os.tmpdir(), "comprehende-"))`

   Unix example:

   ```sh
   REVIEW_DIR=$(mktemp -d)
   # write $REVIEW_DIR/review.json
   ```

6. Run `npx comprehende@0.4.1 validate --data "$REVIEW_DIR/review.json"`. On failure, fix groups or coverage. Do not change the diff.
7. Run `npx comprehende@0.4.1 serve --data "$REVIEW_DIR/review.json" --open` and give the user the localhost URL (`127.0.0.1` only).

## The why

Write document `why` only from a ticket, issue, request description, or human transcript. A dependency can justify only a group `why`. Never derive document `why` from the diff or from group structure.

The UI shows document `why` at the top of Overview when it is present. Document `why` is one or two sentences. Do not paraphrase hunks.

Tickets. Copy `id` from the tracker the user named. Copy `url`, `title`, and `part` when you have them. Read the ticket or issue when you need it to write document `why`. Use a host CLI or MCP if you have one. A host CLI is not required to run this skill. Do not copy the issue body into `review.json`. Omit `part` on a ticket that covers the whole review. A ticket covers the whole review only when the request or ticket title says that it does. Commit count does not determine ticket scope. Put `part` on each ticket that belongs to one story, using the same name as that story's groups.

Request description. If the user named a pull request or merge request, read its description. That text is a source. Do not copy it into `review.json`.

Commit messages. Read `git log` for `base...head`. Do not copy them into `review.json`. Commit messages can clarify group `why`. Never use them to add information to document `why`.

Transcripts. If this change was written in a coding-agent session and you have that transcript, use the human's stated reason. Use a transcript you already have: this session, or a log the user named. Do not call a vendor API to fetch one. Do not paste the transcript into `review.json`. Do not copy the agent's plan, tool trace, or a recap of the diff.

Independent documentation or test-only cleanup in its own part is not a reason to omit document `why`. Write the named motive as document `why`. Give the side work its own group `why`.

Omit document `why` only when those sources are silent. Do not invent a motive from the patch. If the request itself names two unrelated product stories and no source unifies them, omit document `why`. Do not merge them into one motive. That case is rare. Do not write a substitute.

Each group has `why`. Write why this group exists. If a source names this group's concern, use that. If this group has no ticket, commit, or transcript of its own, say that it enables the groups that depend on it. It is enough to say that later groups in the story need this foundation. Do not invent a product motive from the patch.

Every group still needs a `why`, including groups that only exist to enable later ones.

The UI shows each group's `why` before the what and the live git diff.

## The what

Write document `summary` for every review. One or two sentences. Name what this change is, including independent stories when the PR is mixed. It is not a motive. Do not leave it out.

Group `summary` is one sentence that says what this group is. Name how the hunks in the group meet. Example: the new validator in `core.ts` is invoked by the route in `routes.ts`. Do not recap each file. Do not list paths without the interaction.

## Grouping rules

- Group by review concern, not by directory, unless that directory is the concern. Index is not enough to group. Log is not enough to group.
- The same hunk may appear in multiple groups when it matters in more than one story.
- `dependsOn` is a real dependency. The reader needs the earlier group to understand this one. Use it only inside the same story. Reading order inside a story: contracts and foundations first, then call sites, then tests, then mechanical work.
- Do not chain unrelated concerns with `dependsOn` just to force a reading order. Independent work is its own group with no `dependsOn`, and no other group depends on it. A second feature, or independent documentation that could have been its own PR, is independent work.
- Give each independent story a short `part` name. A few words, not a sentence. Put the same `part` on every group in that story. Independent work gets its own `part`. The UI colors layers that share a `part` together.
- If you are not sure two concerns depend on each other, leave `dependsOn` empty and give them different `part` names. A false split is easy to see. A false chain hides a mixed PR.
- Move mechanical work into its own group. Mechanical work is import reordering, identifier-only renames, generated code, formatting, and type re-exports. Keep every hunk. Do not replace those diffs with a file list.
- If the mechanical hunks exist only because of a story, they are the last group of that `part`. No other group depends on them.
- If the mechanical hunks could have been their own pull request, they are their own `part`. Put that part last in `suggestedOrder`.
- Use `suggestedOrder` for the walk through the whole review, including independent parts. Mechanical parts, independent documentation, and test-only cleanup go last.
- Set document `size` to the human review burden, not file or hunk count: `trivial`, `small`, `medium`, `large`, `very-large`. Forty files that only change an import in one group are `small`. Three files that rewrite a contract used by the rest of the system can be `large`.
- Every hunk from `index` must appear in at least one group. Duplicate refs across groups are allowed. Unreferenced hunks fail `validate` and show up as Unassigned in the UI.
- Lockfiles are not hunks. Leave them in `skipped`. Do not add hunk refs for them. The UI has a Lockfiles bucket, closed until the reader opens a file.
- Stale refs (rebase, edited working tree) fail `validate`. `serve` still starts, shows live git, and flags the broken pointer. Do not invent a replacement hunk.

Hunk identity is `(path, oldStart, newStart)` plus `oldPath` when renamed. Copy `oldStart`, `oldLines`, `newStart`, and `newLines` from the index. Do not guess numbers from memory. Image files are hunks too. Copy those refs into groups. Lockfiles and other binaries stay in `skipped`. Git LFS images are read from `.git/lfs/objects` in the clone. If the object is missing, the image slot is empty. Do not paste image bytes or lockfile contents into `review.json`.

## lookFor

Write `lookFor` only when the reader should inspect something the live diff does not make obvious.

Leave it empty when the live hunk is enough. Empty is correct for a rename, a formatting change, or a wording-only docs group. Do not invent inspect items to fill the list.

Each bullet is one inspectable claim. A short tag may name the risk: Subtle, Breaking, Race, Perf. Then one sentence. Straightforward groups do not need a tag, a trace, or extra commentary.

A predicted trace belongs in `lookFor` when a behavior change is hard to see in the hunk. Pick a small, realistic input. Say where the old path and the new path diverge, and what the observable result is. That bullet is a claim. The human checks it against the live git diff. It is not a substitute for the how. Do not add pseudocode, diagrams, or collapsed diffs to the document.

Do not pack commits, file lists, or hunk counts into `lookFor`.

## Write the prose

Document `why`, group `why`, `summary`, and `lookFor` are for a tired engineer on the first read.

- One thought per sentence. If a sentence runs past about 25 words, split it.
- Present tense. Name who does what.
- Use the real symbol, path, flag, or command. Do not invent a synonym.
- Cut every word that does no work.
- No changelog voice. No puffery. No "not just X, but Y".
- Do not decorate a straightforward group. If the live diff is enough, the title, `why`, and `summary` are enough.

Schema: [references/review.schema.json](./references/review.schema.json). Example document: [references/example.md](./references/example.md).

## Accuracy

- Do not generate, clean up, or rewrite diffs. The UI shows live git.
- Do not invent the why from the patch. Document `why` comes from tickets, issues, request descriptions, or transcripts. Group `why` may also say that later groups need this one. If those sources are silent, omit document `why` and still write document `summary`.
- Do not snapshot the repo into `review.json`.
- Do not write `review.json` or the index dump into the repository under review. Use a temp directory.
- If `source` refs do not resolve in cwd, stop. Do not invent refs.
