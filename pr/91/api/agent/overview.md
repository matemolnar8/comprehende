Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff` and `git rev-parse --verify 8febfe58216a23b69f9e3f57c08518a67bafe9d4` in this repository.
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

base (merge-base)  ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff

head               8febfe58216a23b69f9e3f57c08518a67bafe9d4

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames ca6ee19c4ff595fdd307d1eacc7af09bfaa081ff 8febfe58216a23b69f9e3f57c08518a67bafe9d4

Commits:
- 8febfe5 Add a review command that writes a covering skeleton.

Sources:
- ticket #84 Cloud agents paste hunk refs by hand. A CLI helper should write them from base...head.
  https://github.com/matemolnar8/comprehende/issues/84
- pr-comment Mate on #84 The CLI must not invent a review. Stub prose only; the skill fills interpretation.
  https://github.com/matemolnar8/comprehende/issues/84#issuecomment-5752428124
- pr PR #91 Adds comprehende review, a covering skeleton, and skill/docs that start from that file.
  https://github.com/matemolnar8/comprehende/pull/91
- commit Add a review command that writes a covering skeleton. Indexes base...head and writes every hunk ref with stub prose only. Interpretation stays with the skill.

The title:

Dogfood helper: review current branch vs main

The why:

[#84](source:s1) asks for a CLI that writes hunk refs so agents stop pasting them. [Mate](source:s2) says that file is a skeleton: the skill still fills title, why, summary, groups, and lookFor.

The what (small):

`comprehende review` indexes live git and writes a covering skeleton. The next skill, README, and AGENTS.md start from that file instead of a hand-built review.json.

Look for:
- [#84](source:s1) asked the helper to validate and optionally serve or export. `review` validates coverage after write and prints serve/export as next steps; it does not start a server.
- [#84](source:s1) named `origin/main...HEAD`. Defaults match `index`: `origin/HEAD`, then main or master.
- [Mate](source:s2) says the CLI must not invent a review. The skeleton title is `Untitled`, one `ungrouped` group, and no document why, lookFor, sources, or parts.
- The published skill in `skills/comprehende/` is not released, so `npx skills add` still starts from `index`.

## Review concerns

### 01 Covering skeleton (`skeleton`)

`skeletonDocument` copies every index hunk into one `ungrouped` group with stub prose. `cmdReview` writes that JSON and validates coverage.

[groups/skeleton.md](groups/skeleton.md)

### 02 review command (`cli`)

`comprehende review` takes the same `--base`/`--head` as `index`, requires `--data`, writes the skeleton path, and prints fill then validate/serve/export.

Depends on:
- 01 Covering skeleton (`skeleton`)

[groups/cli.md](groups/cli.md)

### 03 Skeleton coverage tests (`tests`)

Unit tests compare skeleton hunk refs to the index, reject missing `--data`, and the packed bin writes the same covering file.

Depends on:
- 02 review command (`cli`)

[groups/tests.md](groups/tests.md)

### 04 Skill starts from review (`skill`)

The next skill writes a covering skeleton with `review --data`, then fills and splits groups from those refs.

Depends on:
- 02 review command (`cli`)

[groups/skill.md](groups/skill.md)

### 05 README and AGENTS (`docs`)

README documents `comprehende review`. AGENTS.md tells PR dogfood to start from that skeleton.

Depends on:
- 02 review command (`cli`)

[groups/docs.md](groups/docs.md)

### 06 Installed next-skill copy (`agents-copy`)

`pnpm sync:skill` copies the new workflow and example into `.agents`.

Depends on:
- 04 Skill starts from review (`skill`)

[groups/agents-copy.md](groups/agents-copy.md)