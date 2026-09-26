Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3` and `git rev-parse --verify 9b0fb44297c60c7c1fdc979ce5d3d9d00f7b23ef` in this repository.
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

base (merge-base)  732a01b08eaa2f79562ea4e2ef76e38c9d92eee3

head               9b0fb44297c60c7c1fdc979ce5d3d9d00f7b23ef

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3 9b0fb44297c60c7c1fdc979ce5d3d9d00f7b23ef

Commits:
- 9b0fb44 Skill: keep a feature spec with its seed, and a new harness with its build
- ac4d693 Skill: catch hidden identity, setup side effects, and skip-safe generated files

Sources:
- pr PR #119 Tighten the skill for Grok 4.6 high so a full eval suite goes green after #118.
  https://github.com/matemolnar8/comprehende/pull/119
- ticket #117 Iterate the skill until graded runs match the written expected outcomes.
  https://github.com/matemolnar8/comprehende/issues/117
- pr PR #118 Grok 4.6 high became the default producer. One sample still missed useQRCodeSVG identity, .env.local deletion, schema equivalence, and over-split cigster-99.
  https://github.com/matemolnar8/comprehende/pull/118

The title:

Skill: catch Grok's remaining eval misses after #118

The why:

[#117](source:s2) asks to iterate the skill until reviews match the expected outcomes. Grok 4.6 high is the producer, and [#118](source:s3) still missed identity changes, setup-script deletes, generated meaning, and extra harness parts.

The what (small):

The next skill adds lookFor cases for identity traces, production hunks in test PRs, and setup scripts that delete developer files. Mechanical summaries must say when generated output means the same. A feature spec stays with its seed. A new harness stays with the build that runs it. Unasked enabling work stays one harness part. The `.agents` copy is identical.

## Review concerns

### 01 Skill lookFor and grouping rules (`skill`)

`skills-next/comprehende/SKILL.md` adds the lookFor, mechanical, and part rules. `.agents/skills/comprehende/SKILL.md` is an identical copy.

[groups/skill.md](groups/skill.md)