---
name: comprehende
description: Groups a git diff into review concerns and opens a local UI so humans can comprehend AI-generated code changes. Use when reviewing a PR, a branch diff, a turn diff, or when the user asks to run comprehende or to upload the report.
license: MIT
compatibility: Requires Node.js 24+, git, and a git work tree as the current working directory.
---

# Comprehende

Group a git diff into review concerns and serve a local UI. The point is cognitive offloading over cognitive surrender: the human gets a why and a what of their own to hold against the live diff, instead of adopting the change blind.

Run every command inside the repository under review. Cwd is the repo; there is no `--repo` flag. Use the pinned CLI:

```sh
npx comprehende@0.9.0 <command>
```

The review document is interpretation only. It holds a title, groups, summaries, and hunk pointers. Do not copy patch text into it. `serve` reads the diff from git.

## Workflow

Each step is one tool call where the step says so. Batch the commands as written; every extra round trip re-sends the whole context.

1. Name base and head. Use the refs the user named; three-dot (`base...head`) is the merge request or branch diff. When the change is already on the default branch, use the request's recorded base and head SHAs; the moving default-branch `HEAD` includes later merges. When only the head SHA is known, base is the merge-base of that head with the named base branch. Fetch a ref that is missing from the local clone. Done when both ref names are chosen. The next shell call verifies them.
2. One shell call: verify the refs, check the CLI version, write the covering skeleton, log, and stat. `$REVIEW_DIR` comes from `mktemp -d` in that call (outside the repository; the work tree stays untouched, with no new gitignore entries). `&&` stops the shell before `review` when a ref does not resolve. Stop and tell the user which ref failed, rather than guess a ref.

   ```sh
   REVIEW_DIR=$(mktemp -d) && git rev-parse --verify --end-of-options "<base>^{commit}" && git rev-parse --verify --end-of-options "<head>^{commit}" && {
     npm view comprehende version || true
     npx comprehende@0.9.0 review --base <base> --head <head> --data "$REVIEW_DIR/review.json"
     git log --format='%s%n%n%b' --end-of-options <base>...<head>
     git diff --stat <base>...<head>
   }
   ```

   When the user names a local executable, use that command as written in place of `npx comprehende@0.9.0`, and run `<executable> --version` in this same shell call in place of `npm view`. That printed line is the CLI version.

   If that version is newer than this pin (`npx comprehende@0.9.0`), stop and tell the user. Show `npx skills update` as an option they can run. Do not run that command. Wait for them to continue with this pin, or to update and start this skill again. If the versions match or the query fails, continue. Defaults: `--head` is `HEAD`; `--base` is `origin/HEAD`, falling back to `main` or `master`. `review` indexes live git and writes one path per changed file into one group named `ungrouped`, with stub prose. It does not invent a review. Done when that file exists. Keep those paths. A path covers every live hunk of that file.
3. One shell call for the covering diff, lockfiles in that covering change excluded (the skeleton has no hunk refs for them), and read the sources in the same round trip. From the `--stat` in step 2, pass `:(exclude)<path>` for each lockfile in that covering change. Nested paths stay nested. When the covering `--stat` has no lockfile, run `git diff` with no pathspec.

   ```sh
   git diff <base>...<head> -- . ':(exclude)<path>'
   ```

   Sources are listed under The why and The title. Done when the diff and those sources are in context.
4. Read the skeleton once, for its paths. Recover the why, write the title, write the what, and check each source item against the code at head (see lookFor). Then write document `title` (always), document `summary` (always), document `why` (only when a source names the motive), and document `lookFor` (only when an item diverges; see lookFor). Summaries come from the code, not the log. Replace the stub title and summary. Done when every source item has a verdict from the code at head and every divergence is a document `lookFor` bullet.
5. Group the hunks by review concern, following the Grouping rules. Split the covering group. Copy each path from the skeleton into the group that holds that file. When one file's hunks belong in different groups, name each hunk as in the hunk identity paragraph. Set document `size` from review burden, not `git diff --stat`. Write the whole `review.json` in one write from the field shape below. Keep `version` and `source` from the skeleton. The skeleton's `ungrouped` group is replaced, not kept. Done when every path from the skeleton is in at least one group, every live hunk of a split file is named, every group has its `why`, stub prose is gone, and every named `part` has a matching document `parts[]` entry. Also done when each test file sits in the group of the code it checks (unless tests are the concern), each one-line call site or declaration sits with the code it serves, work no source asks for has its own `part`, and each `dependsOn` id names a group in the same `part`. When a story builds on another part, `suggestedOrder` puts that part first.

   Field shape. The words are placeholders. This shape is enough to write a valid document.

   ```json
   {
     "version": 1,
     "source": { "baseRef": "<base>", "headRef": "<head>", "range": "<base>...<head>" },
     "size": "small",
     "title": "Short name",
     "summary": "What the change is.",
     "groups": [
       {
         "id": "helper",
         "title": "Group title",
         "why": "Why this group exists.",
         "summary": "What this group is.",
         "suggestedOrder": 0,
         "hunkRefs": ["src/file.ts"]
       }
     ]
   }
   ```

   Add a field when the section that defines it says to write it: document `why`, `lookFor`, and `parts` (`name`, `summary`); `sources` (`id`, `kind` of `ticket`, `pr`, `pr-comment`, `commit`, or `transcript`, `label`, plus `url`, `title`, `gist`, and `part` when you have them). On a group: `part`, `sources` (those ids), `lookFor`, `dependsOn` (group ids). A `pr-comment` source also has `author` and `body`. A line pin adds `path`, `side` (`old` or `new`), and `line` together. `size` is `trivial`, `small`, `medium`, `large`, or `very-large`.
6. Run `npx comprehende@0.9.0 validate --data "$REVIEW_DIR/review.json"` with the absolute path. It checks exactly these: every live hunk sits in a group, every ref matches live git, every `source:` id exists in `sources`, every group `part` has a `parts[]` entry, every PR comment pin (`path`, `side`, `line`) matches a live line, and the document has no unknown fields. On failure, fix what the message names; the diff is git's, leave it alone. Done when validate exits 0.
7. When they ask to upload the report, follow Export. Otherwise run `npx comprehende@0.9.0 serve --data "$REVIEW_DIR/review.json" --open` and give the user the localhost URL (`127.0.0.1` only).

`references/example.md` is an optional filled sample of the field shape. The shape in step 5 is enough to write the document.

## Export

Write a static site and put that folder where they asked.

```sh
npx comprehende@0.9.0 export --data "$REVIEW_DIR/review.json" --out "$EXPORT_DIR"
```

`$EXPORT_DIR` is a fresh directory outside the work tree, not a git repository. The folder is the UI plus frozen git payloads. There is no git in it. Done when they have the URL or path they named. If `review.json` is still a skeleton, finish the Workflow through validate, then export.

## The title

Document `title` is a short name for the whole change. Always write one.

Prefer a title the human already wrote when it names this change: the pull request title, a ticket title, or the name they used in a transcript. Keep that wording when it is descriptive and represents the reviewed change.

Invent a title when those sources are missing, vague, or name something else. A branch slug, "WIP", or "fix" is not a title. Sources are a reference. Do not paste a title that does not fit.

## The why

Document `why` names why the work exists, in one or two sentences, inferred only from the sources below. It is the problem or goal a source states. Before writing it, find the source sentence that states that problem or goal: "Support SSO login", "so admins can export audit logs", "retries flood the API". A sentence that only says what the change does ("the settings page becomes a modal", "uploads move to S3") belongs in the summary. When no source sentence states a problem or goal, or the sources are mixed, omit the why. Do not derive document `why` from the diff, from group structure, or from a motive you infer from the patch. A request naming two unrelated product stories with no unifying source also gets no document `why`; each story keeps its own group `why`s.

Sources are read, never copied into the review document, except PR review comments: copy `author` and `body` so the UI can show the quote. Keep ticket bodies, request descriptions, commit text, and transcript text out of `review.json`. Cite a source in prose with `[text](source:s1)` when that sentence leans on it.

- Tickets and issues. Emit a `sources` item: short `id` (`s1`), `kind` `ticket`, `label` (`#24`), plus `url`, `title`, `gist`, and `part` when you have them. Read the ticket (host CLI, tools or MCP, whichever is available) when document `why` needs it. `part` goes on a ticket that belongs to one story, matching that story's group `part`; omit it only when the request or ticket title says the ticket covers the whole review. Commit count proves nothing about ticket scope. Do not copy the ticket body.
- Pull request. When the user named a pull request or merge request, emit `kind` `pr` with a label like `PR #32` and a gist from the description. Do not copy the description. PRs can also refer to tickets and issues in their description or branch names.
- PR comments. Emit `kind` `pr-comment`. Label like `alice on PR #32`. Copy `author` and `body`. For a review comment on a line, also copy `path`, `side` (`old` or `new`, git-shaped, not GitHub LEFT/RIGHT), and `line`. A conversation comment has no pin. Flatten threads: one source per comment.
- Commit messages. `git log --format='%s%n%n%b' --end-of-options <base>...<head>`. Emit `kind` `commit` when a commit names the motive. `label` is that subject line, or a SHA from the same log. They can clarify group `why`; document `why` needs one of the stronger sources above. These can also contain issues and tickets.
- Transcripts. A coding-agent (like Cursor, Claude Code, Codex, etc.) transcript you already have (this session, or a historical one) supplies the human's stated reason. Emit `kind` `transcript`, a label like `Cursor session · Aug 12`, and a gist. Omit `url`. Do not copy transcript text.

Put those ids on the group `sources` array when the group uses them, even if the prose does not cite them inline. `validate` fails on a `source:` href whose id is missing from `sources`.

Every group has `why`: why this group exists. A source that names the concern is best. A foundation group with no source of its own says it enables the groups that depend on it; that is a complete `why`. Independent side work in its own part (docs-only, test-only) gets its own group `why` and leaves document `why` to the named motive.

## The what

Document `summary` is one or two sentences naming what the change is, including each independent story when the PR is mixed. Every review has one, even when `why` is absent. It is a what, not a motive.

When groups use `part`, write one document `parts[]` entry per independent story. `name` is that `part` string. `summary` is one sentence saying what that story is, same voice as group `summary`. Document `summary` still names the stories; the part summary is the per-story what under the colored Overview column. Omit `parts` when no group has `part`.

Group `summary` is one sentence saying what the group is, describing how its hunks are related: "Calling the new validator from `core.ts` by the route in `routes.ts`", not a file-by-file recap or a path list.

## Grouping rules

- Group by review concern: why these hunks are read together. A directory qualifies only when that directory is the concern. Grouping needs the diffs; the index and the log alone are not enough.
- A group is one concern a reviewer names in a phrase. The code, the tests that check it, and the one-line call sites, declarations, and re-exports that serve it read together in that group. Tests are their own group only when they are the concern, or when one test covers several groups. A small change has one to three groups.
- A hunk may appear in several groups when it matters in more than one story. When one hunk holds two concerns, the group that holds it names both.
- `dependsOn` marks a real dependency inside one story: the reader needs the earlier group to understand this one. It stays inside one part. Reading order inside a story: contracts and foundations, then call sites, then mechanical work. Independent work stands alone with its own `part`, empty `dependsOn`, and nothing depending on it; a second feature, work no source asks for (extra product events, a dependency refresh), or standalone documentation that could have been its own PR is independent work. When unsure whether two concerns depend on each other, keep them separate under different parts: a false split is easy to see, a false chain hides a mixed PR.
- `part` is a short name (a few words) for one independent story, the same on every group in that story; the UI colors shared parts together. One document `parts[]` entry per name.
- Mechanical work (import reordering, identifier-only renames, generated code, formatting, pure moves, synced copies) is its own group that keeps every hunk as refs, risk visible rather than folded into a file list. Its summary tells the reader what they can skip and why that is safe: an identical copy, a pure move, regenerated output that means the same as before. When it exists only because of a story, it is that part's last group with nothing depending on it. When it could have been its own PR, it is its own part.
- `suggestedOrder` walks the whole review, independent parts included. Mechanical parts, independent documentation, and test-only cleanup go last.
- Document `size` is human review burden: `trivial`, `small`, `medium`, `large`, `very-large`. Forty files changing one import in one group are `small`; three files rewriting a contract the rest of the system hangs on can be `large`.
- Coverage: every live hunk sits in at least one group. A path covers every live hunk of that file. Duplicate refs across groups are allowed. Unreferenced hunks fail `validate` and show as Unassigned in the UI.
- Lockfiles have no hunk refs; the CLI leaves them out of the skeleton and the UI gives them their own closed bucket. Hunk refs exist only for hunks the skeleton lists.
- A path stays valid when a rebase only shifts line numbers. `path@oldStart+newStart` goes stale when those starts move, and that fails `validate`. `serve` still starts, shows git at those SHAs, and flags the broken pointer. Re-run `review` and copy fresh paths. A dirty work tree does not make refs stale.

A `hunkRefs` entry is a path string when the group holds every live hunk of that file. Copy the path from the skeleton. When a file is split across groups, name each hunk as `path@oldStart+newStart`, or `old/path -> new/path@oldStart+newStart` when that hunk is a rename. Take `oldStart` and `newStart` from the hunk's `@@ -oldStart,oldLines +newStart,newLines @@` header. Identity is `(path, oldStart, newStart)` plus `oldPath` when renamed. Image files are paths. Git LFS images are read from `.git/lfs/objects` in the clone; a missing object leaves the image slot empty.

## lookFor

`lookFor` is for what a careful engineer would miss on a first read of the live diff. Each bullet is one finding, stated as fact: optionally a short risk tag (Subtle, Breaking, Race, Perf), then one sentence on what the code at head does and what the reader would observe. The human checks it against the live diff and keeps the verdict. Pseudocode, diagrams, collapsed diffs, commit lists, hunk counts, and pass/fail marks stay out.

Group `lookFor` holds claims that live in those hunks. When a behavior change hides in the hunk, a predicted trace earns a bullet: a small realistic input, where the old and new paths diverge, and the observable result. When a hunk works around app behavior (a sleep, a forced write, a retry), the bullet says what the app does without the workaround. Production code inside a test or tooling change earns a bullet. Empty is correct for a rename, a formatting change, or a wording-only docs group; leave it empty rather than fill it.

Document `lookFor` holds claims about the whole change, and the divergences between the sources and the code at head. Source items are each requirement and acceptance item in a ticket, each behavior claim in the pull request description and commit messages, and each request in a review comment. Test plans, manual QA notes, and out-of-scope lists are context, not items. Read the code at head for each item and give it a verdict: done as asked, done differently, not done, or not true at head. Each verdict other than done-as-asked is one bullet: what the source asks or says, what head does, and the reason when a source or the code gives one, or that no source gives one. A citation carries only what that source says; cite a source as the reason for a choice only when it states that reason. Cite with `[text](source:s1)`; the id goes in `sources`, and `validate` fails on an unknown id. Omit the field when every item is done as asked.

## Write the prose

Document `title`, document `why`, group `why`, `summary`, and `lookFor` are for a tired engineer on the first read.

- One thought per sentence; split past about 25 words.
- Present tense. Name who does what.
- Use the real symbol, path, flag, or command.
- Cut every word that does no work. No changelog voice, no puffery, no "not just X, but Y".
- A straightforward group needs only its title, `why`, and `summary`; the live diff does the rest.
