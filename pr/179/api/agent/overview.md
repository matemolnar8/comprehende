Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify db054c4f8b1d6ad8c9ed216cfc9dcfa7e43cd373` and `git rev-parse --verify 4bf5dbfbcaf8f57667667dbc294b465470cd38d2` in this repository.
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

base (merge-base)  db054c4f8b1d6ad8c9ed216cfc9dcfa7e43cd373

head               4bf5dbfbcaf8f57667667dbc294b465470cd38d2

Named refs at pin: db054c4f ... 4bf5dbfb

Read the diff:

git diff --find-renames db054c4f8b1d6ad8c9ed216cfc9dcfa7e43cd373 4bf5dbfbcaf8f57667667dbc294b465470cd38d2

Commits:
- 4bf5dbfb Skill: generated-output rule needs evidence; a mismatch is not safe to skip; mirrors merge within one concern
- e0b0ee67 Skill: unflagged generated output gets its own group; mirrors merge with same-reason edits

Sources:
- ticket #177 starship-6388 fails the apart check in about a quarter of main evals; done when it passes reliably.
  https://github.com/matemolnar8/comprehende/issues/177
- pr PR #179 Prompt-only fix; failing producers said they trusted the missing CLI mechanical flag.
  https://github.com/matemolnar8/comprehende/pull/179

The title:

Fix the starship-6388 eval flake: unflagged generated output gets its own group

The why:

`starship-6388` fails on and off because the review puts `src/modules/vcs.rs` and `.github/config-schema.json` in one group, and the flake [hides real regressions](source:s1).

The what (small):

The skill gets two grouping rules: generated output the CLI does not flag is mechanical and gets its own group, and a draft `mirrors-<n>` group merges with files that serve the same concern. The `.agents` copy is synced.

Look for:
- The ticket is done when `starship-6388` passes reliably [across repeated graded eval runs](source:s1). The PR proves it with 40 producer runs that use the deterministic checks only, with no grader; the graded suite runs after the merge to `main` [per the PR](source:s2).

## Review concerns

### 01 Generated output the CLI misses (`generated-output`)

The mechanical bullet in Grouping rules now makes generated output the CLI missed its own group when the diff shows the generator, with a summary that says whether the output matches the code at head.

Attention (tradeoff):
A file such as a checked-in schema now leaves the group of the code it comes from, so the reader checks it in a separate group. The rule fires only when the diff shows the generator or build step, so a hand-written schema with no such step stays with its story. Output that does not match its code must not get a skip summary.

[groups/generated-output.md](groups/generated-output.md)

### 02 Mirrors groups merge with same-concern edits (`mirrors-merge`)

Step 3 now lets a draft `mirrors-<n>` group merge with files that serve the same concern with a different edit, and each repeated file's note names the file it repeats.

Attention (tradeoff):
A merged mirrors group loses its own read-one-skip-the-rest group. The repeat signal moves into the file notes, so the reader opens one group with mixed edits instead of two.

[groups/mirrors-merge.md](groups/mirrors-merge.md)

### 03 Synced agent skill copy (`synced-copy`)

Generated copy of `skills-next/comprehende/SKILL.md` with the same two edits; the reader can skip it.

[groups/synced-copy.md](groups/synced-copy.md)