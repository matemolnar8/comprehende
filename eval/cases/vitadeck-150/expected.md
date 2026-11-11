# vitadeck-150: Stop agents rediscovering how to drive the host window, and fix four repo traps

PR #150. No ticket. One Codex review comment asks for `../scripts/gui-drive.sh` in the manual-testing skill, and the head commit `b0a30605` makes that fix. One retro motivates the PR, but the fixes are independent: a GUI drive script, a Docker smoke ownership fix, a shared demo section count, a Pages republish fix, a single stb_ds implementation unit, and docs moves.

## Story

- Title: the PR title, or a close paraphrase.
- Why: present. The PR body says a retro of 10 agent sessions found the time goes on stale or missing know-how.
- Size: small or medium. Most of the diff is docs and small script fixes; the new 160-line drive script adds the most. No later group depends on a new contract.
- Parts: 5 or 6. The drive script and the four fixes are 5 stories. The agent docs are a sixth part, or they fold into the drive part. The retro is one motive, not one story.
- Groups: about 6.

## Groups

1. Host window driving: `scripts/gui-drive.sh` and `.agents/skills/vitadeck-manual-testing/SKILL.md`.
2. Docker smoke hands back JS output: `scripts/smoke-docker.sh`.
3. One demo section count: `tests/demo_sections.h`, the `DEMO_SECTION_COUNT` hunks of `tests/deck_app_input_harness.c` and `tests/smoke_harness.c`, the comment in `js/examples/demo/src/App.tsx`, `.agents/skills/vitadeck-smoke/SKILL.md`, and the `js/examples/` hunk of `AGENTS.md`.
4. Pages republish keeps `evidence/`: `.agents/skills/pages/scripts/pages-review.ts`, `.agents/skills/pages/SKILL.md`, and the screenshot hunk of `AGENTS.md`.
5. stb_ds compiles once: `src/core/stb_ds.c`, `CMakeLists.txt`, `src/main.c`, and the removed `STB_DS_IMPLEMENTATION` lines in the harnesses.
6. Agent docs: the other `AGENTS.md` hunks, `CODING_STANDARDS.md`, `docs/releasing.md`, and the build and emulator skills.

## Must

- `tests/demo_sections.h` holds `DEMO_SECTION_COUNT`, which sets `ROUNDS` in `deck_app_input_harness.c` and which `smoke_harness.c` static-asserts `PAGES` against.
- `src/core/stb_ds.c`, compiled in `vitadeck_core`, now holds the only `STB_DS_IMPLEMENTATION`.
- `scripts/smoke-docker.sh` hands file ownership back from an EXIT trap, so it also does this when a step fails.
- `AGENTS.md` now tells agents to publish PR screenshots in the Pages `evidence/` folder, not to upload them to GitHub.

## Good

- `CODING_STANDARDS.md` takes the review rules from `AGENTS.md` and adds manifest, ADR, and glossary rules.
- The `demo-*` key scripts in `src/core/bench.c` still count sections by hand, and only the comment above `SECTIONS` reminds the author to update them.
- Only commit `7c5ef35d` gives the reason for the stb_ds change: a new harness that used a core file with stb_ds did not link without its own copy.

## Must not

- Do not say the PR's "13 harnesses" is wrong, because `tests/js_limits_harness.c` builds two harness executables.

## Notes

- This case checks that independent fixes under one motive become separate parts. `partsApart` holds each pair of the five fix files: `scripts/gui-drive.sh`, `scripts/smoke-docker.sh`, `tests/demo_sections.h`, `pages-review.ts`, and `src/core/stb_ds.c`, except the Docker smoke and stb_ds pair. Both are build fixes, so one build-fixes part is fine if each keeps its own group. With that part and the agent docs folded into another part, the review has 4 parts. The `apart` pairs keep the Docker smoke and stb_ds groups apart, so a review has at least 5 groups. The agent docs have no part expect. `tests/deck_app_input_harness.c`, `tests/smoke_harness.c`, and `AGENTS.md` hold hunks of more than one story, so they have no expect.
- Each fix story keeps one Must for its core change, because no other Must covers that part of the diff. The `AGENTS.md` screenshot rule is a Must because it hides in the Pages commit, the PR body does not mention it, and it changes where PR evidence lives. Outside the diff, `.github/workflows/pages-reviews.yml` prunes the whole PR folder, `evidence/` included, when the PR closes, so screenshot links in a merged PR body stop working.
- The PR body says the stb_ds implementation leaves `main.c` and 13 harnesses. The hunks touch 12 harness files, but `CMakeLists.txt` builds `tests/js_limits_harness.c` twice (`js_limits_harness` and `js_limits_vita_stack_harness`), so 13 is right. A past run flagged it as a mismatch.
