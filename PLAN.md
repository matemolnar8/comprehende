# Comprehende — implementation plan

Product intent lives in [AGENTS.md](./AGENTS.md). This file is the working plan: locked decisions, architecture, data model, and build order.

## Locked decisions

- **Distribution:** hybrid. Agent Skill for the review workflow; npm CLI (`comprehende`) for git I/O and the local UI.
- **Package name:** `comprehende` (unscoped). GitHub repo is public. Install skill with `npx skills add <owner>/comprehende`.
- **UI stack:** Vite + React + TypeScript.
- **Hunk ownership:** a hunk may appear in multiple groups. Coverage still requires every git hunk to appear in at least one group.
- **Diff source of truth:** git, live, at serve time. The review document must not contain patch text or file contents.
- **CLI cwd:** the CLI is run inside the repository under review. Repo path defaults to the current working directory. Do not snapshot the repo into the data layer.

## Architecture

Two artifacts from one repo:

```
human ── /comprehende ──► agent skill
                            │
                            ├─ 1. comprehende index   (git hunk index, no patch text)
                            ├─ 2. LLM writes review.json (groups + summaries + hunk refs)
                            ├─ 3. comprehende validate
                            └─ 4. comprehende serve --data review.json
                                      │  cwd = the repo
                                      ▼
                                 local UI
```

- **Skill** (`skills/comprehende/`): when to run, grouping rules, schema, “never invent diffs,” launch commands. Distributed via `npx skills add`.
- **CLI** (`comprehende` on npm): talks to git in cwd, validates the review document, serves the SPA + git-backed APIs.

The skill may call `npx comprehende@<pinned>` so the UI is not stuffed into the skill folder (size limits, versioning, long-running server).

### Why the CLI owns git

The UI is a projector. If review JSON carried hunk lines, that copy could drift from the repo, and we would have failed the accuracy goal. Serve-time git means:

- Diffs, full files, blame, and commit metadata are always `git` output from the repo the CLI was started in.
- `review.json` is only interpretation: what to look at, in what order, and why.
- Opening a review of repo A while cwd is repo B is a user error; the CLI should refuse if `source` refs don’t resolve.

## Data layer

JSON is pointers and prose. No unified diff, no file bodies, no blame.

```ts
type ReviewDocument = {
  version: 1
  source: {
    baseRef: string
    headRef: string
    range?: string
  }
  tickets?: { id: string; url?: string; title?: string }[]
  groups: ReviewGroup[]
}

type ReviewGroup = {
  id: string
  title: string
  summary: string
  suggestedOrder: number
  hunkRefs: HunkRef[]
}

type HunkRef = {
  path: string
  oldPath?: string
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
}
```

`HunkRef` matches a `git diff` hunk header (`@@ -oldStart,oldLines +newStart,newLines @@`) plus path. Identity is `(path, oldStart, newStart)` (include `oldPath` when renamed).

**Index vs document:** `comprehende index` prints the current hunk list for the agent (paths + @@ ranges, still no line content). The agent assigns those refs to groups. `comprehende serve` re-runs `git diff` in cwd and joins by `HunkRef`. The index is a helper for the agent, not something the UI stores.

**Coverage:** every hunk in the live `git diff` of `source.baseRef...source.headRef` must be referenced by ≥1 group. Unreferenced hunks are a validation error and an “unassigned” bucket in the UI. Duplicate refs across groups are allowed.

**Stale refs:** if a `HunkRef` does not match a live hunk (rebase, uncommitted edit), serve still shows the live git diff and flags the broken pointer. Git wins. Do not invent a replacement hunk.

**Drill-down** is CLI APIs against cwd, not fields in JSON: full file (`git show`), blame, log, rename detection. The document may list ticket ids; the UI may fetch titles only if the user already has `gh`/env locally — never required.

## Repo layout

```
comprehende/
  AGENTS.md
  PLAN.md
  README.md
  package.json              # name: comprehende, bin: comprehende
  src/
    cli/
    git/                    # index, diff, show, blame — no LLM
    schema/                 # TS types + JSON Schema
    ui/                     # Vite + React SPA
  skills/comprehende/       # npx skills add
    SKILL.md
    references/
  fixtures/                 # tiny git repos + review.json (refs only)
```

One publishable package plus the skill directory. pnpm, strict `tsc`. No extra workspace packages until needed.

## CLI surface (v1)

Run inside the target repo.

```
comprehende index  [--base <ref>] [--head <ref>]
comprehende validate --data <review.json>
comprehende serve --data <review.json> [--port] [--open]
```

- `base` / `head` default to a documented convention (e.g. upstream default branch … `HEAD`). Override via flags or `source` in the JSON.
- `serve` binds localhost only. It re-reads git on request (or on an explicit refresh); it does not cache patch text in the document.
- No `--repo` flag in v1. Cwd is the repo. If cwd is not a git work tree, exit with an error.

## Skill (hand-written, phase 4)

Workflow:

1. Resolve the range (PR, `main...HEAD`, user-specified).
2. Run `comprehende index` in the repo. Do not paste or rewrite patch text into `review.json`.
3. Write groups + summaries + `hunkRefs` only.
4. `comprehende validate`. On failure, fix groups, never “fix” the diff.
5. `comprehende serve --data review.json` and give the user the localhost URL.

Grouping rules (v1):

- Group by review concern, not by directory, unless the concern *is* a layer.
- Same hunk may appear in multiple groups when it matters in more than one story.
- Reading order: contracts / foundations first, then call sites, then tests, then chores.
- Summaries say what changed and why it matters. Do not paraphrase the patch.

Keep `SKILL.md` under 500 lines; put schema excerpts and examples in `references/`.

## UI (phase 2–3)

Fixed chrome, data-driven. Group-first, not file-alphabet-first.

- Left: groups in `suggestedOrder`.
- Center: live hunks for the selected group (from git, joined by `hunkRefs`).
- Secondary: file tree derived from the live diff; full file / blame as drill-down.
- Visible **unassigned** hunks so coverage failures cannot hide.
- Unified diff first; split view later.
- Design: dense, readable, familiar to GitHub users, but the primary nav is groups.

The browser never computes diffs. It asks the local server.

## Out of scope for v1

- Hosted app, accounts, uploading the repo
- AI-generated or “cleaned up” patches
- IDE extension, PR comment posting
- GitHub review threads / CI checks clone
- `--repo` pointing at a path other than cwd

## Build order

### 0. This plan

Written. Product intent stays in `AGENTS.md`.

### 1. Repo skeleton

`git init` (if needed), LICENSE, `.gitignore`, pnpm, `package.json`, `tsconfig`, README (run locally, install skill). Stub `skills/comprehende/SKILL.md` so `npx skills add ./` works during development.

### 2. Schema + git index (accuracy kernel)

JSON Schema + TS types for `ReviewDocument` (no patch fields). `comprehende index` / `validate` against a fixture git repo (rename, multi-hunk file, binary skip). Tests: index has no line content; validate enforces coverage; extra/missing refs fail.

### 3. Serve + UI skeleton

Vite React shell (groups nav / diff pane / file tree placeholder). `comprehende serve --data fixtures/example.json --open` from inside the fixture repo. SPA talks to the CLI; hunks rendered from live git. Skill stub: “if review.json exists, run serve.”

Success: browser shows fixture groups and **git** hunks, not typed-in diffs.

### 4. Diff viewer + file browser

Unified diff, syntax highlight, wrap toggle, hunk headers. Selecting a group filters to its hunks. File tree as secondary nav. Full-file via `git show`. Blame and commit list next, same API pattern.

### 5. Hand-written skill

Author grouping rules and the extract → validate → serve loop by hand. Pin `npx comprehende@<version>`. Dogfood on this repo.

### 6. Test, iterate, ship

- Unit: index, validate, coverage, stale refs
- CLI smoke: serve fixture, HTTP 200, git join
- Playwright later, fixture only
- Hand-eval grouping on 2–3 real PRs
- Publish: public GitHub (`npx skills add <owner>/comprehende`) and npm (`npx comprehende`) when ready; `pnpm exec` is enough until then

## First implementation slice

Phase 1 + 2: schema, `index`, `validate`, one fixture repo, `serve` that can dump joined hunks (even ugly HTML). Pretty chrome after the git join is real.
