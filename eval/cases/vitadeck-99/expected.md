# vitadeck-99: Record vendored patches; upload_vita syncs emoji assets

PR #99, fixes issues #87 and #93. Three comments. Two independent chores, each closing its own issue: a record of local patches to vendored code, and an `upload_vita` step that uploads the emoji images.

## Story

- Title: the PR title.
- Why: present. Issue #87 asks to record vendored patches, and issue #93 reports missing emoji after a code-only upload.
- Size: small or medium.
- Parts: two.
- Groups: 2 to 4.

## Groups

1. Vendored patch record: `vendor/PATCHES.md`, `vendor/jimp/README.md`, `docs/adr/0003-native-package-manifest-module.md`, `vendor/stb_ds.h`.
2. Emoji upload: `CMakeLists.txt` and the `vitadeck-build` skill note.

## Must

- `vendor/PATCHES.md` lists each local change to vendored code: `stb_ds.h`, `jimp/jimp.h`, and the `quickjs` submodule.
- `upload_vita` now uploads the emoji PNGs through one curl config written at configure time, and a stamp per build directory and Vita IP skips the step when the images did not change.
- The patch record and the emoji upload are two parts, each with its own `parts[]` entry.

## Good

- The `stb_ds.h` hunk restores upstream's trailing newline, so the diff against upstream holds only the marked change.

## Must not

- Do not put the `CMakeLists.txt` emoji upload in the patch record part.
- Do not add a `dependsOn` between the two parts.

## Notes

- This case checks that two chores that close two issues become two parts.
