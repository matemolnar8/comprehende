Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify c1093ea2d07e3b2e5660edd75776ef686d8aa12b` and `git rev-parse --verify 4b4c6ee30f0d32c24aa64a810fd43738c4bb5b82` in this repository.
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

base (merge-base)  c1093ea2d07e3b2e5660edd75776ef686d8aa12b

head               4b4c6ee30f0d32c24aa64a810fd43738c4bb5b82

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames c1093ea2d07e3b2e5660edd75776ef686d8aa12b 4b4c6ee30f0d32c24aa64a810fd43738c4bb5b82

Commits:
- 4b4c6ee3 Skill: a review comment that asked for code at head is cited on its group
- c2321883 Eval: keep personal rules out of the producer and save its session id

Sources:
- ticket #178 8 of 48 main eval runs failed with missing pr-comment sources on shadcn-10453, cobra-2356 and caddy-8015.
  https://github.com/matemolnar8/comprehende/issues/178
- pr PR #180 Debriefs blame the circular emit rule; v1 passes 30/30 locally; the harness drops personal rules.
  https://github.com/matemolnar8/comprehende/pull/180

The title:

Reviews cite the PR comments that asked for the code

The why:

[Reviews sometimes leave PR comments out of their sources](source:s1), so the eval check fails with `missing source kinds: pr-comment` on three cases.

The what (small):

The skill now cites a review comment on the group whose code that comment asked for. The eval producer stops loading personal agent rules and keeps its session id.

Look for:
- [The issue is done when reviews cite PR comments across repeated graded eval runs](source:s1). [The PR measures 30 local runs without graders and 2 graded runs per case](source:s2); the graded suite on `main` runs only after merge.

## Review concerns

### 01 Cite the comment that asked for the code (`skill-rule`)

The PR comments rule in The why and the Attention rule both now cite a review comment on the group that holds the code it asked for; `.agents/skills` repeats the same edit.

Attention (tradeoff):
Every comment that asked for code at head now gets a `pr-comment` source, even when the PR body repeats the outcome. Reviews carry more quotes, and a small nit that changed code also qualifies. Bots, thanks, and approvals ask for no code, so they stay out.

[groups/skill-rule.md](groups/skill-rule.md)

### 02 Eval producer matches CI and keeps its session (`harness`)

`runMuseCodeAgent` passes `--no-foreign-personal-context` to `muse exec` and returns the parsed `sessionId` on a finished run.

[groups/harness.md](groups/harness.md)