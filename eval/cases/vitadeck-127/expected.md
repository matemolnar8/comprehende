# vitadeck-127: Classify emoji above U+1F000 by Emoji_Presentation; gate tests/ with clang-format

PR #127, closes issue #119. Two comments. The issue asks for two small things, and the PR does each in its own commit: `clang-format.sh` now covers `tests/` with a one-time whitespace reformat of the harnesses, and the emoji classifier drops its `>= U+1F000` shortcut.

## Story

- Title: the PR title, or the issue title.
- Why: present. Issue #119 names both items as follow-ups from the review of #114.
- Size: small or medium.
- Parts: two. Issue #119 lists them as two separate items, and the PR body says the reformat commit is kept separate so it does not hide the real change.
- Groups: 2 to 4. The harness reformat is mechanical.

## Groups

1. Emoji classification: `src/ui/glyph_cache.c`, `src/ui/glyph_cache.h`, and the new `expect_cluster` cases in `tests/glyph_cache_harness.c`.
2. Format gate on `tests/`: `scripts/clang-format.sh`, `AGENTS.md`, `.agents/skills/vitadeck-build/SKILL.md`, and the whitespace-only reformat of the other harnesses, which can be a trailing mechanical group of the same part.

## Must

- `vd_emoji_cluster` no longer treats every codepoint at or above U+1F000 as emoji; it uses the Emoji_Presentation table, which now covers all of Unicode 17.
- A following skin tone now also starts an emoji cluster, so modifier sequences without U+FE0F still draw as one image.
- `scripts/clang-format.sh` `check` and `format` now cover `tests/`, and the other harness changes are whitespace only.
- The emoji fix and the format gate are two parts, each with its own `parts[]` entry.

## Good

- The PR accepts that a non-emoji followed by a skin tone (`a🏻`) now draws only `a`.

## Must not

- Do not put the harness reformat in the emoji part.
- Do not say the harness reformat changes test behavior.

## Notes

- This case checks that one ticket with two independent items becomes two parts. `tests/glyph_cache_harness.c` holds hunks of both stories, so it has no expect.
