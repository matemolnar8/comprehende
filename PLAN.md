# Comprehende — implementation plan

Product intent lives in [AGENTS.md](./AGENTS.md). This file is the working plan: locked decisions, what shipped, and what is left.

**Shipped:** phases 0–4 (CLI, schema, live git, UI). **Left:**

1. [#2](https://github.com/matemolnar8/comprehende/issues/2) npm-publishable package (before the skill is finalized)
2. [#3](https://github.com/matemolnar8/comprehende/issues/3) skill reviewed and rewritten by hand (Máté)
3. [#4](https://github.com/matemolnar8/comprehende/issues/4) test against personal repos
4. [#5](https://github.com/matemolnar8/comprehende/issues/5) drill-down convenience — open, no design yet

## Locked decisions

Unchanged.

- **Distribution:** hybrid. Agent Skill for the review workflow; npm CLI (`comprehende`) for git I/O and the local UI.
- **Package name:** `comprehende` (unscoped). GitHub repo is public. Install skill with `npx skills add matemolnar8/comprehende`.
- **UI stack:** Vite + React + TypeScript.
- **Hunk ownership:** a hunk may appear in multiple groups. Coverage still requires every git hunk to appear in at least one group.
- **Diff source of truth:** git, live, at serve time. The review document must not contain patch text or file contents.
- **CLI cwd:** the CLI is run inside the repository under review. Repo path defaults to the current working directory. Do not snapshot the repo into the data layer.

npm publish is how the CLI is distributed (`npx comprehende`). That is not a hosted app. The review UI still runs only on localhost against git in cwd.

## Architecture

Two artifacts from one repo:

```
human ── /comprehende ──► agent skill
                            │
                            ├─ 1. comprehende index   (git hunk index, no patch text)
                            ├─ 2. write review.json    (groups + summaries + hunk refs)
                            ├─ 3. comprehende validate
                            └─ 4. comprehende serve --data review.json
                                      │  cwd = the repo
                                      ▼
                                 local UI
```

- **Skill** (`skills/comprehende/`): when to run, grouping rules, schema, “never invent diffs,” launch commands. Distributed via `npx skills add`. **Máté reviews and rewrites this by hand** before it is treated as final. See remaining work.
- **CLI** (`comprehende` on npm): talks to git in cwd, validates the review document, serves the SPA + git-backed APIs.

Once the package is publishable, the skill should call `npx comprehende@<pinned>` so the UI is not stuffed into the skill folder (size limits, versioning, long-running server). Today the skill still tells agents to use a built binary, `pnpm dev`, or a global link.

### Why the CLI owns git

The UI is a projector. If review JSON carried hunk lines, that copy could drift from the repo, and we would have failed the accuracy goal. Serve-time git means:

- Diffs, full files, blame, and commit metadata are always `git` output from the repo the CLI was started in.
- `review.json` is only interpretation: what to look at, in what order, and why.
- Opening a review of repo A while cwd is repo B is a user error; the CLI should refuse if `source` refs don’t resolve.

Patches shown in the UI are **slices of live `git diff` stdout** (file header + selected hunk bytes). The CLI does not reconstruct unified patches from parsed fields.

## Data layer

JSON is pointers and prose. No unified diff, no file bodies, no blame.

Shipped document shape (extras beyond the original sketch are marked):

```ts
type ReviewDocument = {
  version: 1
  source: {
    baseRef: string
    headRef: string
    range?: string
  }
  walkthrough?: string // extra: whole-change read for Overview
  size: "trivial" | "small" | "medium" | "large" | "very-large" // extra: human review burden, not file count
  tickets?: { id: string; url?: string; title?: string }[]
  groups: ReviewGroup[]
}

type ReviewGroup = {
  id: string
  title: string
  summary: string
  lookFor?: string[] // extra: scannable inspect list
  dependsOn?: string[] // extra: earlier layer ids
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

`HunkRef` matches a `git diff` hunk header (`@@ -oldStart,oldLines +newStart,newLines @@`) plus path. Identity is `(path, oldStart, newStart)` (include `oldPath` when renamed). Additional properties are rejected so patch text cannot sneak in.

**Index vs document:** `comprehende index` prints the current hunk list for the agent (paths + @@ ranges, still no line content). The agent assigns those refs to groups. `comprehende serve` re-runs `git diff` in cwd and joins by `HunkRef`. The index is a helper for the agent, not something the UI stores.

**Coverage:** every hunk in the live `git diff` of `source.baseRef...source.headRef` must be referenced by ≥1 group. Unreferenced hunks are a validation error and an “unassigned” bucket in the UI. Duplicate refs across groups are allowed.

**Stale refs:** if a `HunkRef` does not match a live hunk (rebase, uncommitted edit), serve still shows the live git diff and flags the broken pointer. Git wins. Do not invent a replacement hunk.

**Drill-down** is CLI APIs against cwd, not fields in JSON: full file (`git show`), blame (`git blame --line-porcelain`), log, rename detection. The document may list ticket ids; the UI renders `id` / `url` / `title` from the document. It does not fetch a host. Host CLIs are never required.

Drill-down **works** (file inspector, blame inspector, commit list on Overview, header refs/SHAs). Convenience of that drill-down is an open product question — no design yet.

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
    server/                 # localhost HTTP, git-backed APIs
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

- `base` / `head` default to `origin/HEAD` (fallback `main` / `master`) … `HEAD`. Override via flags or `source` in the JSON.
- `serve` binds `127.0.0.1` only. It re-reads git on every request; it does not cache patch text in the document.
- No `--repo` flag in v1. Cwd is the repo. If cwd is not a git work tree, exit with an error.

## UI (shipped)

Fixed chrome, data-driven. Group-first, not file-alphabet-first.

- Left: review **stack** — Overview, then groups in `suggestedOrder`, then Unassigned. Layers show `lookFor` and `dependsOn`.
- Center: live hunks for the selected group (from git, joined by `hunkRefs`). Unified and split (50/50, resizable). Wrap toggle. Hunk headers from git ranges, not invented `@@` prose.
- Secondary: file tree derived from the live diff; full file / blame as drill-down inspectors.
- Visible **unassigned** hunks so coverage failures cannot hide.
- Diffs, full files, and blame are painted with [`@pierre/diffs`](https://diffs.com) from live git text. The browser never computes diffs.

The original plan said “unified first; split later.” Split shipped. Syntax highlight is Pierre/Shiki, not a custom table.

## Out of scope for v1

- Hosted app, accounts, uploading the repo
- AI-generated or “cleaned up” patches
- IDE extension, PR comment posting
- GitHub review threads / CI checks clone
- `--repo` pointing at a path other than cwd

## Build order

### 0–4 — done

| Phase | Intent | What actually shipped |
|---|---|---|
| 0. Plan | This file + `AGENTS.md` | Kept; this revision actualizes it |
| 1. Skeleton | LICENSE, pnpm, stub CLI/skill | Done |
| 2. Schema + git index | Types, `index` / `validate`, fixture (rename, multi-hunk, binary skip) | Done. Index has no line content. Coverage and extra/missing refs fail validate |
| 3. Serve + UI | Groups / live hunks / file tree; fixture serve | Done |
| 4. Diff viewer + file browser | Unified, highlight, wrap, group filter, `git show`; blame and commits next | Done, then exceeded: Pierre renderer, split view, blame inspector, commit list, stack chrome |

Unit tests cover index, validate, coverage, stale refs, and HTTP smoke (`serve` fixture, git join). Playwright was “later, fixture only” and is **not** the next milestone.

### Prerequisite to 5 — npm-publishable package

Done mechanically. `prepack` builds CLI + UI; UI libraries are `devDependencies`; `pnpm pack:smoke` installs the tarball in a foreign cwd and runs `index` / `validate` / `serve`. README uses `npx comprehende@0.1.0`. CI publishes from `main` when `package.json` version is new.

First npm publish (unscoped name `comprehende`, account, trusted publisher for workflow `ci.yml`) is Máté’s. Until that exists, CI skips publish.

Issue: [#2](https://github.com/matemolnar8/comprehende/issues/2)

### 5. Skill — review and rewrite by hand (Máté)

Not an agent rewrite. The current `skills/comprehende/` is a working draft so the loop could be dogfooded. **Máté reviews it and rewrites it by hand.**

Keep `SKILL.md` under 500 lines; the JSON Schema lives in `skills/comprehende/references/review.schema.json` (copied from `src/schema/review.schema.json` by `pnpm sync:skill`). Example stays in `references/example.md`. Pin `npx comprehende@<version>` once the prerequisite exists.

#### Differences vs the original plan (and vs this draft)

These are the deltas to resolve in the rewrite — not a request to keep or drop them blindly.

1. **How the agent invokes the CLI.** Plan: `npx comprehende@<pinned>`. Draft: `node /path/to/comprehende/dist/cli/main.js`, `pnpm dev` only when this repo is under review, or `pnpm link --global`. That is checkout-era. The rewrite should assume a published package.

2. **Who writes `review.json`.** Locked: the agent writes groups from `index` output after reading the live git diffs. `comprehende generate` is removed. Path-heuristic drafts are not a substitute for concern-based grouping.

3. **Summary contract.** Plan: “Summaries say what changed and why it matters. Do not paraphrase the patch.” Draft: `summary` is **one sentence** (intent of the layer); `lookFor` is bullets of what to inspect; optional document `walkthrough` is one or two sentences for Overview. The UI is built around that split. The rewrite should either adopt it as the contract or change the product.

4. **Reading order.** Plan: prose rule — contracts / foundations, then call sites, then tests, then chores. Draft: same idea encoded as `dependsOn` plus a stack Overview. Confirm that is the grouping model, not directory-first.

5. **Schema extras.** `walkthrough`, `lookFor`, `dependsOn` are in the shipped schema and UI. They were not in the original PLAN types. Keep, rename, or drop in the hand rewrite — the JSON Schema must match whatever you write. Canonical file: `src/schema/review.schema.json`. `pnpm sync:skill` copies it into `skills/comprehende/references/` and mirrors that skill tree into `.agents/skills/comprehende/`. Tests fail on drift. Do not maintain a separate `schema.md`.

6. **Host recipe.** Draft had a GitHub `git fetch origin pull/<n>/head` snippet and optional `gh pr view`. The skill is vendor-agnostic (GitHub, Bitbucket, local branches). Three-dot `base...head` is the request diff. Tickets may live on the document; host CLIs are never required.

7. **Install story.** Plan: `npx skills add matemolnar8/comprehende` from the public repo. Draft skill does not mention `skills add`. README already splits checkout install vs “once published.” The rewrite should describe the published install only.

8. **Dogfood target.** Original phase 5 said “dogfood on this repo.” That is now phase 6 (personal repos). This repo can still be a fixture; it is not the definition of done for the skill.

9. **Preserve.** Accuracy rules in the draft match the plan and should stay: never copy patch text into `review.json`; git wins on stale refs; refuse unresolved `source`; cwd is the repo; no `--repo`; UI is a projector.

Issue: [#3](https://github.com/matemolnar8/comprehende/issues/3) (blocked on [#2](https://github.com/matemolnar8/comprehende/issues/2))

### 6. Test against personal repos

Definition of done for “does this work” is running the CLI (and, after 5, the skill) against Máté’s real repositories — not Playwright, not only `fixtures/repo`.

Known candidates already in the README: [vitadeck](https://github.com/matemolnar8/vitadeck) (public) and cigster (private). Use whatever repos are actually under review; those are examples, not a closed list.

What to learn:

- `index` / `validate` / `serve` on real three-dot ranges (including GitHub PR diffs).
- Grouping quality if an agent writes the document: coverage, stale refs after rebase, multi-hunk files, renames, binaries.
- Whether drill-down is usable enough on real files to live with until there is a design.

After npm publish, re-run the same loop via `npx comprehende@<pinned>` so we are not only testing the checkout.

Issue: [#4](https://github.com/matemolnar8/comprehende/issues/4)

### Open — drill-down convenience

Full file, blame, and commits exist. They need to be easier to use. There is no design yet. Do not invent a UX. Capture pain from phase 6 (jumping from a hunk into the surrounding file, blame vs a separate inspector, commit list vs hunk, ticket links) and come back.

Issue: [#5](https://github.com/matemolnar8/comprehende/issues/5)

## First implementation slice (historical)

Phase 2 was the first slice: schema, `index`, `validate`, one fixture repo. Then a `serve` that joined hunks. Pretty chrome after the git join was real. That sequence is finished.
