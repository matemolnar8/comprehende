---
name: comprehende
description: Groups a git diff into review concerns and opens a local UI so humans can comprehend AI-generated code changes. Use when reviewing a PR, a branch diff, a turn diff, when a reviewed change has new commits, or when the user asks to run comprehende or to upload the report.
license: MIT
compatibility: Requires Node.js 24+, git, and a git work tree as the current working directory.
---

# Comprehende

Group a git diff into review concerns and serve a local UI. The point is cognitive offloading over cognitive surrender: the human gets a why and a what of their own to hold against the live diff, instead of adopting the change blind.

Run every command inside the repository under review. Cwd is the repo. Use the pinned CLI:

```sh
npx comprehende@0.11.0 <command>
```

The review document is interpretation only. It holds a title, groups, summaries, and hunk pointers. `serve` reads the diff from git.

Work from the digest, not the diff. The digest is one line per file: kind, hunks, symbols, pairing and copy hints. Fetch patch with `show`, in the one call of step 3.

## Workflow

When a review document for this change already exists, follow Refresh instead.

Each step is one tool call where the step says so. Batch the commands as written; every extra round trip re-sends the whole context. Spend one tool call per phase: the step-2 batch with its sources, one show batch, one write that ends in validate. Further calls only fix what validate names.

1. Name base and head. Use the refs the user named; three-dot (`base...head`) is the merge request or branch diff. When the change is already on the default branch, use the request's recorded base and head SHAs; the moving default-branch `HEAD` includes later merges. When only the head SHA is known, base is the merge-base of that head with the named base branch. When the user names a ref that is not in the clone, `git fetch <remote> <ref>` goes first in the step-2 call. Done when both ref names are chosen.
2. One shell call: verify the refs, write the draft, print the digest, the draft, the log, and the sources. `$REVIEW_DIR` comes from `mktemp -d` in that call, outside the repository. `&&` stops the shell before `pregroup` when a ref does not resolve; tell the user which ref failed.

   ```sh
   REVIEW_DIR=$(mktemp -d) && git rev-parse --verify --end-of-options "<base>^{commit}" && git rev-parse --verify --end-of-options "<head>^{commit}" && {
     npm view comprehende version || true
     npx comprehende@0.11.0 pregroup --base <base> --head <head> --data "$REVIEW_DIR/review.json"
     npx comprehende@0.11.0 digest --base <base> --head <head>
     cat "$REVIEW_DIR/review.json"
     git log --format='%s' --end-of-options <base>..<head>
     for f in "<sourcesDir>"/*; do echo "=== $f"; head -c 10000 "$f"; done
   }
   ```

   Sources are the request or ticket body, each review comment with whether its thread is resolved, whether the comment is outdated, and its current line, and the commit subjects. Files on disk get the loop above; a host CLI fetch joins the call through the same `head -c 10000`. Sources only an MCP reaches go in one parallel block after this call, one fetch each. A ticket number in the request, the branch name, or a commit subject names a ticket to read here.

   When the user names a local executable, use that command as written in place of `npx comprehende@0.11.0`, and run `<executable> --version` in this same shell call in place of `npm view`. That printed line is the CLI version. If that version is newer than this pin (`npx comprehende@0.11.0`), stop and tell the user. Show `npx skills update` as an option they can run. Do not run that command. Wait for them to continue with this pin, or to update and start this skill again. If the versions match or the query fails, continue.

   `pregroup` writes a draft: `mirrors-<n>` groups of files that received the same change, one `mechanical` group (renames, copies, moves, generated output), and one `change` group for the rest, with stub prose. The `cat` prints the draft. Trust the `same change as`, `pairs with`, and `replaces` hints; a file that `replaces` a deleted one, and the file it `replaced`, are a new version, not a move, and read with their story. Done when the digest, the draft, the log, and the sources are in context.

3. Group the hunks by review concern, starting from the draft, and fetch the patch the decision needs. Accept a draft group that already holds one concern. Split the `change` group where a reader would stop and review the first piece alone. Merge draft groups that serve one concern. Name each story that could have been its own PR: the asked story, and each dependency policy change (exact versions loosened to ranges, or the reverse), standalone document, refactor of files the asked story does not need, or production code in a PR about tests. Each story is a `part` on its groups; one story means no `part`. Up to six files in the digest: fetch every file that is not mechanical or a copy. Past six: fetch only the hunks that decide a split or earn a lookFor bullet, eight fetches at most, and state each reason first ("`login.ts` hunks may belong apart"). Draft `mirrors-<n>` and `mechanical` groups need no fetch. One show call:

   ```sh
   npx comprehende@0.11.0 show --base <base> --head <head> --hunk "<ref>"; npx comprehende@0.11.0 show --base <base> --head <head> --file "<path>"
   ```

   Done when every story has a `part` name or there is one story, and the show output is in context or nothing needs a fetch.

4. Write the document. Document `title` (always), document `summary` (always), and document `why` (only when a source names the motive). Check each source item against the digest and the fetched hunks; each divergence is a document `lookFor` bullet (see lookFor). Summaries come from the digest symbols and kinds, plus fetched hunks. Every group has `why` and `summary`. A group `summary` is one sentence that names one relation among its hunks, not a list of its files. Before each citation, find the sentence in that source that says the claim, and cite that source for that sentence only (see The what and The why). A group whose fetched hunk hides a behavior change has a `lookFor` bullet with the predicted trace (see lookFor). Copy each ref from the draft into the group that holds it, verbatim; the draft refs already match live git. A path covers every hunk of its file; write hunk refs (`path@oldStart+newStart`, see Grouping rules) only for a file split across groups. Keep `version` and `source` from the draft. Write the whole `review.json` in one shell call from the field shape below: a quoted heredoc, then `validate`.

   ```sh
   cat > "$REVIEW_DIR/review.json" <<'EOF'
   <the document>
   EOF
   npx comprehende@0.11.0 validate --data "$REVIEW_DIR/review.json"
   ```

   Done when every source item has a verdict and every divergence is a document `lookFor` bullet; every behavior change a fetched hunk shows is a group `lookFor` bullet; every ref from the draft is in at least one group; every live hunk of a split file is named; stub prose is gone; every named `part` has a document `parts[]` entry; each `dependsOn` id names a group in the same `part`; every citation rests on a sentence its source says. Also done when each unit test sits in the group of the code it checks, each helper several groups call sits in the foundation group they share, each new harness sits with the build or CI that runs it, each feature spec sits with its seed and helpers, each one-line call site or declaration sits with the code it serves, unasked work that could have been its own PR has its own `part`, related enabling work stays one part, and each mechanical summary says what the reader can skip. When a story builds on another part, `suggestedOrder` puts that part first.

   Field shape. The words are placeholders. This shape is enough to write a valid document.

   ```json
   {
     "version": 1,
     "source": <the draft's source object, unchanged>,
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

   Add a field when the section that defines it says to write it: document `why`, `lookFor`, and `parts` (`name`, `summary`); `sources` (`id`, `kind` of `ticket`, `pr`, `pr-comment`, `commit`, or `transcript`, `label`, plus `url`, `title`, `gist`, and `part` when you have them). On a group: `part`, `sources` (those ids), `lookFor`, `dependsOn` (group ids). A `pr-comment` source also has `author` and `body`, and a pin (`path`, `side`, `line`) when PR comments under The why say so. `size` is `trivial`, `small`, `medium`, `large`, or `very-large`.

5. `validate` ends the step-4 call; after a fix or a Refresh edit, run `npx comprehende@0.11.0 validate --data "$REVIEW_DIR/review.json"` with the absolute path. It checks: every live hunk sits in a group, every ref matches live git, every `source:` id exists in `sources`, every directory ref holds only mechanical files, every group `part` has a `parts[]` entry, every `dependsOn` names a group in the same `part`, every PR comment pin (`path`, `side`, `line`) matches a live line, and the document has no unknown fields. On failure, fix what the message names; the diff is git's, leave it alone. Done when validate exits 0.
6. When the user asks to upload the report, follow Export. Otherwise run `npx comprehende@0.11.0 serve --data "$REVIEW_DIR/review.json" --open` and give the user the localhost URL (`127.0.0.1` only).

`references/example.md` is an optional filled sample of the field shape.

## Export

Write a static site and put that folder where the user asked.

```sh
npx comprehende@0.11.0 export --data "$REVIEW_DIR/review.json" --out "$EXPORT_DIR"
```

`$EXPORT_DIR` is a fresh directory outside the work tree, not a git repository. The folder is the UI plus frozen git payloads. There is no git in it. Done when the user has the URL or path they named. If `review.json` is still a draft, finish the Workflow through validate, then export.

## Refresh

Carry an existing review over to new commits or a rebase. Prose for a hunk that did not change stays as it is; only the groups the report names get new words.

The previous document is the `review.json` the user names, or the `document` field of a hosted export's `api/review.json`. Copy it into a fresh directory first:

```sh
REVIEW_DIR=$(mktemp -d) && curl -fsSL "<site-url>/api/review.json" | jq .document > "$REVIEW_DIR/review.json"
```

1. One shell call: fetch the refs, refresh, and print the document. The refs default to the document's own `baseRef` and `headRef`, resolved again; pass `--head` or `--base` when the user names another.

   ```sh
   git fetch --quiet <remote> && {
     npx comprehende@0.11.0 refresh --data "$REVIEW_DIR/review.json"
     cat "$REVIEW_DIR/review.json"
   }
   ```

   `refresh` keeps a hunk whose path and changed lines are the same, wherever it now starts, and re-points its ref. A hunk edited in place (same file, same region, other lines) is `changed` and keeps its group; when only whitespace moved it is `reformat`. A ref whose hunk left the diff is dropped. Every hunk no group covers lands in a draft `update` group with stub prose, and so does every new hunk under a directory ref. The report prints the new commit subjects, one line per file whose hunks changed (`new`, `changed`, `reformat`, `same`, `gone`, and the groups it sits in), and per group what moved. "nothing to refresh" means the refs still resolve to the commits the document names: fetch the right remote or name the head, then run it again. Done when the report and the document are in context.

2. Sources as in step 2 of the Workflow, appended to the step-1 shell call. The request body is read again, because document `lookFor` bullets cite it. A comment whose `url` is already in `sources` keeps its entry; copy only its current line and resolved state onto the pin. Read each new comment whole. Commit subjects are in the report. Done when every new comment and subject is in context.

3. One `show` batch, with `--base` and `--head` set to the new range, for the hunks the report marks `new` or `changed`. Up to six listed files: fetch every `new` or `changed` hunk. Past six, the step-3 budget applies to the files the report lists. A `same` or `reformat` hunk is fetched only when a kept `lookFor` bullet rests on it.

4. Edit `review.json` in place with your edit tool; untouched groups stay verbatim. Move each `update` ref into the group that holds its concern, or into a new group, then delete `update`. In a group the report names: rewrite `summary` when the new or changed hunks change what the group is; drop each `lookFor` bullet whose hunk is `gone`; re-check each bullet on a `changed` hunk against the fetched hunk. A named group whose hunks keep their meaning, such as one with only `reformat` hunks, keeps its prose as it is. Delete a group that is `now empty`, and every `dependsOn` that names it. Retire a document `lookFor` bullet that a new commit resolves; a new comment asking for work the change does not do is a new bullet. `size` moves with the new burden; `title` and `why` change only when a source did. Done when `update` is gone, no group is empty, no stub prose remains, and every named group's prose matches the code at head.

5. Steps 5 and 6 of the Workflow: validate, then serve or export to the same place as before. Give the user the URL with `#changes` at the end: that page compares this review with the one `refresh` kept beside it.

## The title

Document `title` is a short name for the whole change. Always write one.

Prefer a title the human already wrote when it names this change: the pull request title, a ticket title, or the name they used in a transcript. Keep that wording when it is descriptive and represents the reviewed change.

Invent a title when those sources are missing, vague, or name something else. A branch slug, "WIP", or "fix" is not a title. A title from a source stays only when it fits.

## The why

Document `why` names why the work exists, in one or two sentences, inferred only from the sources below. It is the problem or goal a source states. Before writing it, find the source sentence that states that problem or goal: "Support SSO login", "so admins can export audit logs", "retries flood the API". A sentence that only says what the change does ("the settings page becomes a modal", "uploads move to S3") belongs in the summary. When no source sentence states a problem or goal, or the sources are mixed, omit the why. Write it in the source's own terms, with no cause, benefit, or reader need the source does not name. A request naming two unrelated product stories with no unifying source also gets no document `why`; each story keeps its own group `why`s.

Every group has `why`: why this group exists. A citation carries only what that source says, and a source is the reason for a choice only when it states that reason. A source that names the concern is best. A foundation group with no source of its own says it enables the groups that depend on it; that is a complete `why`. Independent side work in its own part (docs-only, test-only) gets its own group `why` and leaves document `why` to the named motive.

Sources are read, never copied into the review document, except PR comments: copy `author` and `body` so the UI can show the quote. Keep ticket bodies, request descriptions, commit text, and transcript text out of `review.json`. Cite a source in prose with `[text](source:s1)` when that sentence leans on it.

- Tickets and issues. Emit a `sources` item: short `id` (`s1`), `kind` `ticket`, `label` (`#24`), plus `url`, `title`, `gist`, and `part` when you have them. `part` goes on a ticket when the groups of that story carry the same `part`.
- Pull request. When the user named a pull request or merge request, emit `kind` `pr` with a label like `PR #32` and a gist from the description.
- PR comments. Emit one `pr-comment` source for each comment the prose cites, and for each comment that gets a pin. Label like `alice on PR #32`. Copy `author` and `body`. Flatten threads: one source per comment. Pin a comment whose thread is open, whose forge reports a current line, and which is not outdated. A pin is `path`, `side`, and `line`. `side` is `old` for a line of the base file and `new` for a line of the head file. On GitHub, `LEFT` is `old`, `RIGHT` is `new`, the current line is `line` (`original_line` is the line on an older commit), an open thread has `isResolved` false, and an outdated comment has `isOutdated` true or a null current line. A conversation comment has no line, so no pin.
- Commit messages. `git log --format='%s' --end-of-options <base>..<head>`. Emit `kind` `commit` when a commit names the motive. `label` is that subject line, or a SHA from the same log. They can clarify group `why`; document `why` needs one of the stronger sources above.
- Transcripts. A coding-agent transcript you already have (this session, or a historical one) supplies the human's stated reason. Emit `kind` `transcript`, a label like `Cursor session · Aug 12`, and a gist. Omit `url`.

Put those ids on the group `sources` array when the group uses them, even if the prose does not cite them inline. `validate` fails on a `source:` href whose id is missing from `sources`.

## The what

Document `summary` is one or two sentences naming what the change is, including each independent story when the PR is mixed. Every review has one, even when `why` is absent. It is a what, not a motive.

When groups use `part`, write one document `parts[]` entry per independent story. `name` is that `part` string. `summary` is one sentence saying what that story is, same voice as group `summary`. Document `summary` still names the stories; the part summary is the per-story what under the colored Overview column. Omit `parts` when no group has `part`.

Group `summary` is one sentence saying what the group is, describing how its hunks are related: "The route in `routes.ts` calls the new validator in `core.ts`", not a file-by-file recap or a path list. For draft `mirrors-<n>` and `mechanical` groups kept as-is, the summary says what the reader can skip and why that is safe: the same change repeated, a pure move, or regenerated output that means the same.

## Grouping rules

- Group by review concern: why these hunks are read together. A directory qualifies only when that directory is the concern.
- A group is one concern a reviewer names in a phrase. The code, the unit tests that check it, and the one-line call sites, declarations, and re-exports that serve it read together in that group; the digest `pairs with` hint names a test's module. A new integration harness is the concern: that harness and the build or CI files that run it are one group, not the production group they exercise. A new feature's code, fixtures, seeds, helpers, and the spec that runs them are one group. A foundation split is for a contract several later groups share; a helper several groups call sits in that foundation, with the files that define it. Split a concern only where a reader would stop and review the first piece alone.
- A hunk may appear in several groups when it matters in more than one story. When one hunk holds two concerns, the group that holds it names both.
- `dependsOn` marks a real dependency inside one story: the reader needs the earlier group to understand this one. It stays inside one part. Reading order inside a story: contracts and foundations, then call sites, then mechanical work. Independent work stands alone with its own `part` and empty `dependsOn`. A second feature, extra product events, a dependency policy change, or standalone documentation that could have been its own PR is independent work. Unasked work that only enables the asked story (path renames, fixture layout, local startup) stays one part with that story, or one harness part. Two concerns share a `part` when the asked story needs both; otherwise they are separate parts.
- `part` is a short name (a few words) for one independent story, the same on every group in that story; the UI colors shared parts together. One document `parts[]` entry per name.
- Mechanical work (import reordering, identifier-only renames, generated code, formatting, pure moves) is its own group with its draft refs, so the risk stays visible. The draft `mechanical` group already holds the CLI-flagged files; check each line still belongs (a flagged file with a real behavior change moves out to its story, by its path) and write the summary that says what the reader can skip. A file in a draft `mirrors-<n>` group received the same change as its source; that group's summary says the change repeats. When a mechanical group exists only because of a story, it is that part's last group with nothing depending on it. When it could have been its own PR, it is its own part.
- `suggestedOrder` walks the whole review, independent parts included. Mechanical parts, independent documentation, and test-only cleanup go last.
- Document `size` is human review burden: `trivial`, `small`, `medium`, `large`, `very-large`. Forty files changing one import in one group are `small`. A new component plus follow-up changes across existing screens is `medium`. A new contract that later groups depend on is `large`. That `size` stays when those groups merge.
- Coverage: every live hunk sits in at least one group. A path covers every live hunk of that file. Duplicate refs across groups are allowed. Unreferenced hunks fail `validate` and show as Unassigned in the UI. Every ref in the draft already covers its hunks; splitting a file across groups needs hunk refs, everything else keeps the draft's paths.
- Lockfiles have no hunk refs; the CLI leaves them out of the draft and the UI gives them their own closed bucket. Hunk refs exist only for hunks the draft lists.
- A path stays valid when a rebase only shifts line numbers. `path@oldStart+newStart` goes stale when those starts move, and that fails `validate`; `refresh` re-points it (see Refresh).

A `hunkRefs` entry is a path string when the group holds every live hunk of that file. Copy the path from the draft. A path ending in `/` holds every live hunk under that directory that no other ref names: the most specific ref wins. The digest prints one line for a directory of mechanical files, at least half of them pure renames; the draft holds it as that one ref, and the files listed below that line are already inside it. To move one of those files to its story, put its path in that story's group; the directory ref lets it go. `validate` fails a directory ref that still holds a file that is not mechanical. When a file is split across groups, name each hunk as `path@oldStart+newStart`, or `old/path -> new/path@oldStart+newStart` when that hunk is a rename. Copy `oldStart` and `newStart` from the digest line (`hunks: path@oldStart+newStart`) or from the `@@ -oldStart,oldLines +newStart,newLines @@` header `show` prints. Identity is `(path, oldStart, newStart)` plus `oldPath` when renamed. Image files are paths.

## lookFor

`lookFor` is for what a careful engineer would miss on a first read of the live diff. Default to an empty `lookFor` and earn each bullet with a fetch: a bullet lives only where you ran `show` on its hunks, or where the digest plus the sources already prove it. Each bullet is one finding, stated as fact and true at head: optionally a short risk tag (Subtle, Breaking, Race, Perf), then one sentence on what the code at head does and what the reader would observe. The human checks it against the live diff and keeps the verdict. Pseudocode, diagrams, collapsed diffs, commit lists, hunk counts, and pass/fail marks stay out.

Group `lookFor` holds claims that live in those hunks. Fetch the hunk when a behavior change hides in it and write the predicted trace: a small realistic input, where the old and new paths diverge, and the observable result. These earn a bullet:

- A change in equality or identity (object versus primitive fields, pointer versus contents): two inputs that look the same and now compare differently.
- A hunk that works around app behavior (a sleep, a forced write, a retry): what the app does without the workaround.
- A hunk under application source in a PR whose sources are about tests, CI, or tooling: it is production code in a test PR; name that behavior change.
- A setup or teardown script that deletes or overwrites a file that is not test output: the path, when it happens, and what the developer loses.
- A behavior change no source mentions.
- A hunk that resolves a review comment in a way the hunk alone does not make obvious: what the fix does.

Empty is correct for a rename, a formatting change, or a wording-only docs group. Draft `mirrors-<n>` and `mechanical` groups stay empty unless a fetch proves otherwise.

Document `lookFor` holds claims about the whole change, and the divergences between the sources and the code at head. Source items are each requirement and acceptance item in a ticket, each behavior claim in the pull request description and commit messages, and each request in a review comment. Test plans, manual QA notes, and out-of-scope lists are context, not items. Read the source for each item and give it a verdict: done as asked, done differently, not done, or not true at head. Each verdict other than done-as-asked is one bullet: what the source asks or says, what the digest or fetched hunk shows, and the reason when a source or the code gives one, or that no source gives one. When a later source changes what an earlier one asked (a review comment overrides the ticket), the ticket item is done differently, and the bullet names both sources. A manual step a source says the change needs (turn on a setting, run a migration) is also a bullet. Cite with `[text](source:s1)`; the id goes in `sources`, and `validate` fails on an unknown id. Omit the field when nothing needs a bullet.

## Write the prose

Document `title`, document `why`, group `why`, `summary`, and `lookFor` are for a tired engineer on the first read.

- One thought per sentence; split past about 25 words.
- Present tense. Name who does what.
- Use the real symbol, path, flag, or command.
- Cut every word that does no work. No changelog voice, no puffery, no "not just X, but Y".
- A straightforward group needs only its title, `why`, and `summary`; the live diff does the rest.
