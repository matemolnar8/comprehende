Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ae1bc763799faf6e9cb24702f6267c2807d6d72f` and `git rev-parse --verify 98f0fc86e7a373cabf4c55004f7e66825a40b5a6` in this repository.
   Done when both objects exist.

2. Choose the relevant review concerns.
   Read Review concerns. Fetch a concern file only when that concern is relevant to the question.
   Done when every concern the question touches has its markdown loaded.

3. Answer from live git.
   Follow those files. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  ae1bc763799faf6e9cb24702f6267c2807d6d72f

head               98f0fc86e7a373cabf4c55004f7e66825a40b5a6

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames ae1bc763799faf6e9cb24702f6267c2807d6d72f 98f0fc86e7a373cabf4c55004f7e66825a40b5a6

Commits:
- 98f0fc8 Add refresh: carry a review over to new commits without starting over

Sources:
- ticket #88 Asks for a one-shot refresh path after a rebase, recorded base and head SHAs with a warning on mismatch, and optionally a command tied to a PR number.
  https://github.com/matemolnar8/comprehende/issues/88
- pr PR #146 Closes #88 with a refresh command, pinned commits in source, and a Refresh branch in the skill.
  https://github.com/matemolnar8/comprehende/pull/146
- commit Add refresh: carry a review over to new commits without starting over Names the hunk matching rules: same changed lines keep the ref, an edit in the same region is changed, the rest is new or gone.
- transcript Claude Code session · Oct 21 Máté asked for incremental updates to a PR review without regenerating it, done efficiently, and preferred no full skill redesign.

The title:

Add refresh: carry a review over to new commits without starting over

The why:

[#88](source:s1) says hosted reviews go stale after a rebase or new commits, and agents re-index, rewrite `review.json`, export, and republish by hand. The [session](source:s4) asked for incremental updates that are efficient and that avoid a skill redesign where possible.

The what (medium):

A new `refresh` command re-points an existing `review.json` to the commits its refs resolve to now, and the skill gains a Refresh branch that rewrites only the groups the report names. `pregroup` and `review` record the resolved commits in `source` so `refresh` knows where the last review stood.

Look for:
- [#88](source:s1) asks to display the recorded SHAs and to fail or warn when the work tree does not match. Done differently: `serve` and `export` print a note to stderr naming `refresh` when the refs resolve elsewhere; the UI still shows the live resolved SHAs and nothing fails. `validate` prints no such note.
- [#88](source:s1) suggests a command tied to a PR number. Not done: the skill reads the previous document from a hosted export's `api/review.json` with `curl` and `jq`, and the CLI stays forge-free.
- [#88](source:s1) wants a one-shot path. Done differently: the skill's Refresh branch is five steps (refresh and cat, sources, show, edit, validate and export). The CLI does the mechanical part in one command; the prose still needs the agent.
- No eval case runs `refresh`; coverage is the unit and integration tests in `src/review/refresh.test.ts`. The eval harness has no shape for a previous document plus a later head.

## Review concerns

### 01 Record the resolved commits in source (`pinned-shas`)

`resolveSource` in `src/git/diff.ts` puts `baseSha` and `headSha` into `source`, and `src/schema/review.ts` accepts them as optional fields.

[groups/pinned-shas.md](groups/pinned-shas.md)

### 02 Match hunks across ranges and rewrite the refs (`refresh-engine`)

`matchHunks` in `src/review/refresh.ts` pairs old and new hunks, `refreshDocument` re-points or drops refs and drafts an `update` group for uncovered hunks, `formatRefresh` prints the delta digest, `listNewSubjects` in `src/git/log.ts` lists the new commit subjects, and `reviewFileBody` moves from the test helper into `src/review/write.ts`.

Depends on:
- 01 Record the resolved commits in source (`pinned-shas`)

[groups/refresh-engine.md](groups/refresh-engine.md)

### 03 The refresh command and the drift note (`cli`)

`cmdRefresh` in `src/cli/commands.ts` loads the document, resolves the refs again, diffs both ranges, writes the result, and returns the report; `sourceDrift` builds the note that `serve` and `export` print in `src/cli/main.ts`; `src/cli/args.ts` adds the command and its usage text.

Depends on:
- 02 Match hunks across ranges and rewrite the refs (`refresh-engine`)

[groups/cli.md](groups/cli.md)

### 04 The Refresh branch in the skill (`skill`)

`skills-next/comprehende/SKILL.md` gains a Refresh section, a trigger in the description, a pointer at the top of the Workflow, and a stale-ref bullet that names `refresh`; `.agents/skills/comprehende/SKILL.md` is the identical synced copy and `src/schema/skill-sync.test.ts` pins the new sentence.

Depends on:
- 03 The refresh command and the drift note (`cli`)

[groups/skill.md](groups/skill.md)

### 05 README and glossary (`docs`)

`README.md` adds `comprehende refresh` to the CLI section and `docs/glossary.md` defines Refresh and lists the full command set.

Depends on:
- 03 The refresh command and the drift note (`cli`)

[groups/docs.md](groups/docs.md)

### 06 Regenerated JSON Schema copies (`schema-json`)

Each copy adds the two optional `baseSha` and `headSha` properties under `source`. Skip them; the Zod schema in the first group is the source.

Depends on:
- 01 Record the resolved commits in source (`pinned-shas`)

[groups/schema-json.md](groups/schema-json.md)