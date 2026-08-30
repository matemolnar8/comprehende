---
name: comprehende
description: Groups a git diff into review concerns and opens a local UI so humans can comprehend AI-generated code changes. Use when reviewing a PR, a branch diff, a turn diff, or when the user asks to run comprehende.
license: MIT
compatibility: Requires Node.js 24+, git, and a git work tree as the current working directory.
---

# Comprehende

Group a git diff into review concerns and serve a local UI. The point is cognitive offloading over cognitive surrender: the human gets a why and a what of their own to hold against the live diff, instead of adopting the change blind.

Run every command inside the repository under review. Cwd is the repo; there is no `--repo` flag. Use the pinned CLI:

```sh
npx comprehende@0.6.0 <command>
```

The review document is interpretation only. It holds a title, groups, summaries, and hunk pointers. Do not copy patch text into it. `serve` reads the diff from git.

## Workflow

1. Check npm for a newer package. Run `npm view comprehende version`. If that version is newer than this pin (`npx comprehende@0.6.0`), stop and tell the user. Show this command as an option they can run:

   ```sh
   npx skills update
   ```

   Do not run that command. Wait for them to continue with this pin, or to update and start this skill again. If the versions match or the query fails, continue.
2. Resolve base and head. Use the refs the user named; three-dot (`base...head`) is the merge request or branch diff. When the change is already on the default branch, use the request's recorded base and head SHAs; the moving default-branch `HEAD` includes later merges. When only the head SHA is known, base is the merge-base of that head with the named base branch. Fetch refs missing from the local clone. Done when both refs resolve in cwd; if one still does not resolve, stop and tell the user rather than guess a ref.
3. Run `npx comprehende@0.6.0 index [--base <ref>] [--head <ref>]` and keep the JSON outside the work tree (stdout or a temp file). Defaults: `--head` is `HEAD`; `--base` is `origin/HEAD`, falling back to `main` or `master`. The index lists hunk refs (path plus `@@` ranges), image files (`oldStart` and `newStart` 0), and `skipped` (lockfiles and non-image binaries). It carries no line content.
4. Recover the why, write the title, and write the what. Read the sources listed under The why and The title, read `git diff --stat <base>...<head>` and the diffs themselves, then write document `title` (always), document `summary` (always), and document `why` (only when a source names the motive). Summaries come from the code, not the log.
5. Group the hunks by review concern, following the Grouping rules. Done when every hunk ref from the index appears in at least one group and every group has its `why`.
6. Write `review.json` in a fresh temp directory outside the repository (`mktemp -d` or the platform equivalent; the work tree stays untouched, with no new gitignore entries). Shape per [references/review.schema.json](./references/review.schema.json); worked example in [references/example.md](./references/example.md). Copy hunk objects verbatim from the index. Set document `size` from review burden, not `git diff --stat`.
7. Run `npx comprehende@0.6.0 validate --data "$REVIEW_DIR/review.json"` with the absolute path. On failure, fix groups or coverage; the diff is git's, leave it alone. Done when validate exits 0.
8. Run `npx comprehende@0.6.0 serve --data "$REVIEW_DIR/review.json" --open` and give the user the localhost URL (`127.0.0.1` only).

## The title

Document `title` is a short name for the whole change. Always write one.

Prefer a title the human already wrote when it names this change: the pull request title, a ticket title, or the name they used in a transcript. Keep that wording when it is descriptive and represents the reviewed change.

Invent a title when those sources are missing, vague, or name something else. A branch slug, "WIP", or "fix" is not a title. Sources are a reference. Do not paste a title that does not fit.

## The why

Document `why` names why the work exists, in one or two sentences. This should be inferred only from the sources below. If the sources don't tell us why the change exists, or they are missing, omit it, and let the summary be the main source for getting an idea of the changes. If sources are available and they tell the story, don't derive document `why` from the diff, from group structure, or from a motive you infer from the patch. A request naming two unrelated product stories with no unifying source also gets no document `why`; each story keeps its own group `why`s.

Sources are read, never copied into the review document, except PR review comments: copy `author` and `body` so the UI can show the quote. Keep ticket bodies, request descriptions, commit text, and transcript text out of `review.json`. Cite a source in prose with `[text](source:s1)` when that sentence leans on it.

- Tickets and issues. Emit a `sources` item: short `id` (`s1`), `kind` `ticket`, `label` (`#24`), plus `url`, `title`, `gist`, and `part` when you have them. Read the ticket (host CLI, tools or MCP, whichever is available) when document `why` needs it. `part` goes on a ticket that belongs to one story, matching that story's group `part`; omit it only when the request or ticket title says the ticket covers the whole review. Commit count proves nothing about ticket scope. Do not copy the ticket body.
- Pull request. When the user named a pull request or merge request, emit `kind` `pr` with a label like `PR #32` and a gist from the description. Do not copy the description. PRs can also refer to tickets and issues in their description or branch names.
- PR comments. Emit `kind` `pr-comment`. Label like `alice on PR #32`. Copy `author` and `body`. For a review comment on a line, also copy `path`, `side` (`old` or `new`, git-shaped, not GitHub LEFT/RIGHT), and `line`. A conversation comment has no pin. Flatten threads: one source per comment.
- Commit messages. `git log --format='%s%n%n%b' --end-of-options <base>...<head>`. Emit `kind` `commit` when a commit names the motive. They can clarify group `why`; document `why` needs one of the stronger sources above. These can also contain issues and tickets.
- Transcripts. A coding-agent (like Cursor, Claude Code, Codex, etc.) transcript you already have (this session, or a historical one) supplies the human's stated reason. Emit `kind` `transcript`, a label like `Cursor session · Aug 12`, and a gist. Omit `url`. Do not copy transcript text.

Put those ids on the group `sources` array when the group uses them, even if the prose does not cite them inline. `validate` fails on a `source:` href whose id is missing from `sources`.

Every group has `why`: why this group exists. A source that names the concern is best. A foundation group with no source of its own says it enables the groups that depend on it; that is a complete `why`. Independent side work in its own part (docs-only, test-only) gets its own group `why` and leaves document `why` to the named motive.

## The what

Document `summary` is one or two sentences naming what the change is, including each independent story when the PR is mixed. Every review has one, even when `why` is absent. It is a what, not a motive.

Group `summary` is one sentence saying what the group is, describing how its hunks are related: "Calling the new validator from `core.ts` by the route in `routes.ts`", not a file-by-file recap or a path list.

## Grouping rules

- Group by review concern: why these hunks are read together. A directory qualifies only when that directory is the concern. Grouping needs the diffs; the index and the log alone are not enough.
- A hunk may appear in several groups when it matters in more than one story.
- `dependsOn` marks a real dependency inside one story: the reader needs the earlier group to understand this one. Reading order inside a story: contracts and foundations, then call sites, then tests, then mechanical work. Independent work stands alone with its own `part`, empty `dependsOn`, and nothing depending on it; a second feature or standalone documentation that could have been its own PR is independent work. When unsure whether two concerns depend on each other, keep them separate under different parts: a false split is easy to see, a false chain hides a mixed PR.
- `part` is a short name (a few words) for one independent story, the same on every group in that story; the UI colors shared parts together.
- Mechanical work (import reordering, identifier-only renames, generated code, formatting, type re-exports) is its own group that keeps every hunk as refs, risk visible rather than folded into a file list. When it exists only because of a story, it is that part's last group with nothing depending on it. When it could have been its own PR, it is its own part.
- `suggestedOrder` walks the whole review, independent parts included. Mechanical parts, independent documentation, and test-only cleanup go last.
- Document `size` is human review burden: `trivial`, `small`, `medium`, `large`, `very-large`. Forty files changing one import in one group are `small`; three files rewriting a contract the rest of the system hangs on can be `large`.
- Coverage: every hunk from the index sits in at least one group; duplicate refs across groups are allowed. Unreferenced hunks fail `validate` and show as Unassigned in the UI.
- Lockfiles stay in `skipped`; the UI gives them their own closed bucket. Hunk refs exist only for hunks the index lists.
- Stale refs (rebase of the pinned commits) fail `validate`; `serve` still starts, shows git at those SHAs, and flags the broken pointer. Re-run `index` and copy fresh refs. A dirty work tree does not make refs stale.

Hunk identity is `(path, oldStart, newStart)` plus `oldPath` when renamed. Copy `oldStart`, `oldLines`, `newStart`, and `newLines` from the index. Image files are hunks; copy their refs into groups. Git LFS images are read from `.git/lfs/objects` in the clone; a missing object leaves the image slot empty.

## lookFor

`lookFor` is for what the live diff does not make obvious. Empty is correct for a rename, a formatting change, or a wording-only docs group; leave it empty rather than fill it.

Each bullet is one inspectable claim: optionally a short risk tag (Subtle, Breaking, Race, Perf), then one sentence. When a behavior change hides in the hunk, a predicted trace earns a bullet: a small realistic input, where the old and new paths diverge, and the observable result. The human checks the claim against the live diff; pseudocode, diagrams, collapsed diffs, commit lists, and hunk counts stay out.

## Write the prose

Document `title`, document `why`, group `why`, `summary`, and `lookFor` are for a tired engineer on the first read.

- One thought per sentence; split past about 25 words.
- Present tense. Name who does what.
- Use the real symbol, path, flag, or command.
- Cut every word that does no work. No changelog voice, no puffery, no "not just X, but Y".
- A straightforward group needs only its title, `why`, and `summary`; the live diff does the rest.
