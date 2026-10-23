# starship-6388: feat(vcs): Introduce the VCS module

PR #6388 closes issue #5932. It adds a `vcs` module that tries the VCSes in `order` and renders the inner modules of the first one it finds. Four existing VCS modules move to a shared discovery helper. Two review comments and 25 conversation comments. The comments drop jj support and revert the default format change.

## Story

- Title: the PR title, or a plain line about one `vcs` module that shows only the first VCS found.
- Why: present, from issue #5932. A jj repo colocated with git shows both VCSes in the prompt when the user wants one. The PR body repeats this and adds that new VCSes tend to live beside git.
- Size: medium. One new module with config, tests, docs, and a schema entry, plus a small helper change in four existing modules.
- Parts: 0 or 1. One story.
- Groups: 2 to 5. Three is the usual shape.

## Groups

1. Dispatcher and config: `src/modules/vcs.rs`, `src/configs/vcs.rs`, and the registration lines in `src/configs/mod.rs`, `src/module.rs`, and `src/modules/mod.rs`. `module` reads `VcsConfig`, picks the first `order` entry that `discover_repo_root` finds, and renders that VCS's `<vcs>_modules` string. The tests sit in `vcs.rs`.
2. Existing modules on the shared helper: `src/modules/fossil_branch.rs`, `src/modules/fossil_metrics.rs`, `src/modules/hg_branch.rs`, `src/modules/pijul_channel.rs`. Each module now calls `vcs::discover_repo_root` instead of its own scan. This group may merge into group 1, and it may depend on group 1.
3. Docs: `docs/config/README.md`. The new `VCS` section with the note on why `$vcs` is not in the default prompt. It may sit with group 1.
4. Schema: `.github/config-schema.json`. It is meant to be generated from `VcsConfig`, but it does not match the code at head, so it needs its own read. It may sit with the docs or with the config, but not with the dispatcher as if it were skippable output.

## Must

- The standalone VCS modules stay and `vcs` is not in `PROMPT_ORDER`, so the default prompt does not change and the change is not breaking, although issue #5932 proposed removing the top level VCS modules.
- The `vcs` module renders the matched inner modules inline as its own segments, so a user cannot move some of them to `right_format` and keep the first-VCS choice, a trade-off the docs note says may change.
- `Vcs::try_from` accepts only `fossil`, `git`, `hg` or `mercurial`, and `pijul`, and `module` skips every other `order` entry with no warning, so jj, the case that motivates issue #5932, gets no output yet.
- The `.github/config-schema.json` entry is not regenerated from head: it points to `#/definitions/VcsConfig` and `#/definitions/Vcs` while the file keeps its types under `$defs`, and it limits `order` to a `Vcs` enum without `mercurial`, while `VcsConfig.order` is a `Vec<&str>`.
- `pijul_channel` changes behavior: it used to check only the current directory with `try_begin_scan`, and now `discover_repo_root` scans ancestor directories for `.pijul`, so the channel also shows in subdirectories of a Pijul repo.

## Good

- `fossil_branch`, `fossil_metrics`, and `hg_branch` keep the same ancestor scan as before (`_FOSSIL_` on Windows, `.fslckout` elsewhere, `.hg` folder), while Git discovery goes through `context.get_repo()`.
- The inner modules keep their own `disabled` settings, and `hg_branch`, `hg_state`, `fossil_branch`, `fossil_metrics`, and `pijul_channel` default to `disabled = true`, so with the default config `$vcs` renders nothing in a Mercurial, Fossil, or Pijul repo.
- `$all` expands to the `PROMPT_ORDER` modules that the root format does not name, and modules named only inside `git_modules` do not count, so a format with both `$vcs` and `$all` renders the Git modules twice in a Git repo.
- `discover_repo_root` runs once in `vcs` and again inside each inner module, so the issue's goal of one shared lookup per VCS is not done, which the author defers to follow-up work.
- joshka's open review comment asks for links between the new docs section and the existing VCS module sections, and the docs at head add no such links.
- The tests cover an empty `order`, an empty `<vcs>_modules` string, `$vcs` inside `fossil_modules` (a warning and no output), the `mercurial` alias, and an unknown `order` name.

## Must not

- Do not say the top level VCS modules are removed or that `$vcs` is in the default prompt.
- Do not say jj is supported or that an unknown `order` entry raises an error.
- Do not call `.github/config-schema.json` a safe-to-skip regeneration that matches `VcsConfig`.
- Do not say the four migrated modules keep exactly the same behavior, because `pijul_channel` now scans ancestor directories.
- Do not split the four migrated modules into one group per file.

## Notes

- `$vcs` stays enabled by default (`disabled: false`), which is why the docs note says adding it to the default list would be breaking. Past runs often said only that `$vcs` is absent from the default format and left out that the change is therefore not breaking.
- Past runs almost never stated the inline-rendering trade-off with `right_format`. It comes from davidkna's comment and the docs note, so it is `Must`.
- The schema mismatch shows in the diff on its own: the new block uses `#/definitions/` next to `#/$defs/VcshConfig`, and the `Vcs` enum does not match `Vec<&'a str>`. The `Vcs` enum in `src/modules/vcs.rs` has no `JsonSchema` derive. The PR commit already had the stale block before the merge from master.
- The `disabled = true` defaults, the `$all` expansion, and the double lookup need files outside the diff (`src/configs/*.rs`, `src/print.rs`), so they are `Good`.
- The joshka comment is a docs request that the diff does not do. It is `Good` because the Must list already holds the claims that change how a reader judges the code.
- `case.json`: `groups` 2 to 5 allows the merged shape (dispatcher plus migrated modules, docs plus schema) and the split shape (config, modules, docs, schema apart). `size` medium or large, because a reader can treat the `discover_repo_root` helper as a contract the four modules share. `parts` 0 to 1 for one story. No `mechanicalPaths`: the only generated file is the schema, and it needs a real read. `apart` keeps the schema away from the dispatcher.
