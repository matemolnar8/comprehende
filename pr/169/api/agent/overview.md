Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 5f50618caf4f4029e5dbba2aa5e83419842b8460` and `git rev-parse --verify 213dd6b92c2db8437786bfa0b20327632ea942bd` in this repository.
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
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  5f50618caf4f4029e5dbba2aa5e83419842b8460

head               213dd6b92c2db8437786bfa0b20327632ea942bd

Named refs at pin: origin/t3/group-attention-164 ... HEAD

Read the diff:

git diff --find-renames 5f50618caf4f4029e5dbba2aa5e83419842b8460 213dd6b92c2db8437786bfa0b20327632ea942bd

Commits:
- 213dd6b Questions: cite sources in the group list, index keys, planted Must not, Refresh wording
- 2e72adb Add group intent questions with an Ask agent button

Sources:
- ticket #162 Group questions (at most 2) about intent, with an Ask agent button, across every layer.
  https://github.com/matemolnar8/comprehende/issues/162
- pr PR #169 This change.
  https://github.com/matemolnar8/comprehende/pull/169
- pr PR #168 Lower layer of the stack: group attention, which questions sit under.
  https://github.com/matemolnar8/comprehende/pull/168

The title:

Ask the agent why: intent questions on groups

The why:

[#162](source:s1) asks for questions about intent on each group, because the agent that wrote the change is often in the same session and asking it why is cheap.

The what (medium):

Each group can hold at most 2 `questions` about intent. The group brief lists them under the attention with an Ask agent button, agent-md and What changed show them, refresh counts them, and the skill and eval learn the rule.

Look for:
- [#162](source:s1) says `refresh` re-checks the questions of the groups its report names. At head `formatRefresh` only appends `N questions to re-check` to each named group line; the skill's Refresh step 4 does the re-check. [PR #169](source:s2) gives this split as a decision.

## Review concerns

### 01 Questions field, at most 2 (`schema`)

`questionsSchema` in `review.ts` is a union of `[]`, `[q]`, and `[q, q]`, so `Questions` is a tuple type and a third question fails parse; `source.ts` checks citations in questions, and `parse.test.ts` pins the limit.

Attention (tradeoff):
The tuple union makes the JSON schema an `anyOf` of three tuples instead of `maxItems: 2`. Agents read that JSON schema in `references/review.schema.json`. Decide whether the typed limit is worth the noisier schema.

[groups/schema.md](groups/schema.md)

### 02 Questions in agent markdown and the prompt (`agent-md`)

`live.ts` puts `questions` on each `ApiReview` group, `questionsBlock` prints them in the group and overview markdown, and `agentClipboardPrompt(url, question?)` appends one question after the URL.

Depends on:
- 01 Questions field, at most 2 (`schema`)

[groups/agent-md.md](groups/agent-md.md)

### 03 Questions under the attention (`ui`)

`GroupBrief` renders `QuestionList` after `AttentionAlert`, and each row uses `CopyPrompt` with the new `question` scope, a ghost Ask agent button that copies `askAgentPrompt({ group }, question)`.

Depends on:
- 02 Questions in agent markdown and the prompt (`agent-md`)

[groups/ui.md](groups/ui.md)

### 04 Questions on What changed (`changes`)

`changesPayload` sets `questions` with `listChange` for kept and new groups, `hasChange` counts it, and `Changes.tsx` shows it as a Questions list beside the attention.

Depends on:
- 01 Questions field, at most 2 (`schema`)

[groups/changes.md](groups/changes.md)

### 05 Refresh counts questions to re-check (`refresh`)

`formatRefresh` appends `N questions to re-check` to each named group that is not `now empty`, and the tests pin it for a unit document and the mixed fixture.

Depends on:
- 01 Questions field, at most 2 (`schema`)

[groups/refresh.md](groups/refresh.md)

### 06 Skill rule, example, and glossary (`skill`)

A new Questions section in `skills-next/comprehende/SKILL.md` states the rule, steps 4 and Refresh 4 use it, `example.md` adds the issue's two questions, and the glossary defines Questions; the `.agents/` copies are the `sync:skill` output of the same text.

[groups/skill.md](groups/skill.md)

### 07 Eval: question Must nots and grader input (`eval`)

Ten `expected.md` files gain a case-specific Must not for a question a source answers and two gain a Good entry for an open intent, while `packet.ts`, `checks.ts`, and `graders.ts` pass questions to the grader and the prose lint.

Attention (tradeoff):
`graders.ts` now lets a group question state a Must or Good fact. A question like "Why does X drop `Max-Age`?" also says that X drops it, so Must scores can rise a little against runs before this change.

[groups/eval.md](groups/eval.md)

### 08 Generated JSON schema copies (`schema-json`)

The three `review.schema.json` files are the same generated output with the new `questions` entry, so the reader can skip them after the schema group.

[groups/schema-json.md](groups/schema-json.md)