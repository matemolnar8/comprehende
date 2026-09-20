Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 69d6415a9f77e02741ff146bdee744ff7648204e` and `git rev-parse --verify d05d71698063919c5928f161ed03e5c749f26594` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  69d6415a9f77e02741ff146bdee744ff7648204e

head               d05d71698063919c5928f161ed03e5c749f26594

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 69d6415a9f77e02741ff146bdee744ff7648204e d05d71698063919c5928f161ed03e5c749f26594

Commits:
- d05d716 Refresh smoke eval expects and skip graders on the PR path.

Sources:
- ticket #87 Refresh smoke expects to current product. Keep rebuild. Slim PR smoke is producer, validate, and expects with no graders. Full graded suite is event-driven on skill, schema, or review landings to main, not cron.
  https://github.com/matemolnar8/comprehende/issues/87
- pr PR #90 Implements #87: refreshed smoke expects, `--no-graders`, AGENTS.md PR path, and a path-filtered Actions workflow that needs repo secret CURSOR_API_KEY.
  https://github.com/matemolnar8/comprehende/pull/90

The title:

Refresh smoke eval expects and slim the PR path

The why:

[#87](source:s1) asks smoke to match current product, skip graders, and run the full graded suite after relevant main landings.

The what (small):

Smoke expects match producer output. `--no-graders` skips packet, graders, and site export. AGENTS.md and `eval.yml` split PR smoke from an event-driven full suite.

Look for:
- [#87](source:s1) keeps rebuild. No hunk changes the `eval` script in `package.json`.
- [#87](source:s1) asks to ping on grader spikes. The workflow fails only when `pnpm eval` exits 1.
- [#87](source:s1) names skill, schema, and review paths. `eval.yml` also watches `scripts/eval/` and `eval/cases/`.

## Review concerns

### 01 Smoke expects match current product (`expects`)

`comprehende-50` expects document `why` present. `comprehende-57` drops `together` and widens `parts` to 0-2.

[groups/expects.md](groups/expects.md)

### 02 Skip graders on the smoke path (`no-graders`)

`--no-graders` skips packet, graders, and site export. Case lines omit grouping and prose counts. The HTML report says graders off.

[groups/no-graders.md](groups/no-graders.md)

### 03 PR smoke vs event-driven full suite (`trigger`)

AGENTS.md requires `pnpm eval -- --tag smoke --no-graders`. `eval.yml` runs `pnpm eval` on path-filtered pushes to main and on `workflow_dispatch`.

Depends on:
- 02 Skip graders on the smoke path (`no-graders`)

[groups/trigger.md](groups/trigger.md)