# starship-6388: Introduce the VCS meta module

PR #6388, closes issue #5932. Two review comments and 25 conversation comments.

## Story

- Title: the PR title.
- Why: present, from issue #5932. Colocated repos show both git and jj output when the user wants one. The PR body repeats this and stops at the first VCS found.
- Size: medium. 426 added and 34 removed across 11 files, one new module with tests.
- Parts: 0 to 1. One story, so a review names no part or one. Groups: 3 in the merged shape, up to 5 when config splits from the dispatcher and docs split from the schema. Both shapes are good.
- Diff: PR head `c28138...` is absent from the local cache, so the diff is base `8a6966...` against merge commit `0dd5a4f...` whose parent is exactly base.

## Groups

1. New vcs dispatcher plus config: `src/modules/vcs.rs`, `src/configs/vcs.rs`, and registration in `src/configs/mod.rs`, `src/module.rs`, `src/modules/mod.rs`. The core tries `order` in turn and renders the matched `<vcs>_modules` string for the first VCS found.
2. Existing VCS modules on shared discovery: `src/modules/fossil_branch.rs`, `src/modules/fossil_metrics.rs`, `src/modules/hg_branch.rs`, `src/modules/pijul_channel.rs`. Each module now calls `discover_repo_root` instead of its own scan. Behavior is unchanged.
3. Schema plus docs mirrors: `.github/config-schema.json`, `docs/config/README.md`. Generated schema and matching docs. Skim after group 1.

Config may stand as its own group, and docs and schema may split. The 5 group split is also good. The four migrated modules always stay together.

## Must state

- At head the standalone VCS modules stay and `$vcs` is enabled but absent from the default prompt order, so the change is not breaking. The issue first proposed removing top level modules, and the PR body says they stay for the many VCS use case.
- The issue motivates with jj colocated with git, but at head the dispatcher accepts only fossil, git, hg, and pijul. Unknown order entries are skipped, so `jj` in order gives no jj output until follow up work lands.
- At head the module renders the matched inner modules inline, so segments cannot split across `format` and `right_format`. The docs note warns the format may change for right aligned prompts.

## Good to state

- `mercurial` works as an alias for `hg` in order. A test covers it.
- Fossil discovery keeps `_FOSSIL_` on Windows and `.fslckout` elsewhere. The helper now shares that logic.
- Git discovery still uses `context.get_repo` while the other three use ancestor scans. Default order puts git first.
- `$vcs` inside a `<vcs>_modules` string fails closed with a warning and renders nothing. A test covers it.
- Empty order or an empty matched modules string disables the module. Tests cover both.
- KingMob asked for git in the options and git first in order. At head the table has a `git_modules` row and order starts with git.
- Joshka asked for docs links between the new section and the old modules. At head the section has no such links.

## Must not

- Do not say top level modules were removed. They stay.
- Do not say `$vcs` is in the default prompt. `PROMPT_ORDER` has no `vcs` entry at head.
- Do not claim jj is supported. Unknown names are skipped.
- Do not split the four migrated modules into one group per file. They share one concern.
- Do not chain groups with `dependsOn` across parts. There is one story.

## Baseline

- First musecode run: 5 groups in the split shape, parts 0, size medium, claims 2 of 3. The run split config from the dispatcher and docs from the schema, which widened groups to 5 and dropped the module plus config together check.
- Second musecode run: 4 groups, parts 0, size medium, claims 1 of 3. Passes the widened expects.
- Third musecode run: 4 groups, parts 0, size medium, claims 0 of 3. The review omits two Must state points, so the misses are real.

## case.json

- `why` present, from issue #5932 and the PR body.
- `parts` 0 to 1, `groups` 2 to 5, `size` medium or large. Slack around the merged 3 group estimate, with room for the observed 5 group split. 0 parts allows no named parts.
- `together`: the four migrated modules as one set. `apart`: the new module and the generated schema. No `mechanicalPaths`: the docs are substantive prose, not mechanical output, so the check cannot tell a docs plus schema trailing group from two honest single file groups.
- `sourceKinds`: ticket, pr, pr-comment. The issue, the PR body, and both comment threads shape the review.
- Added three claims: standalone modules stay with `$vcs` out of the default prompt, jj names are skipped, and segments cannot split across `format` and `right_format`.
