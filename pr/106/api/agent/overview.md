Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 6a72e43128d495024364329517b801647812ce40` and `git rev-parse --verify b84519867812a62c793e2a4b9b21a4978b1a5911` in this repository.
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

base (merge-base)  6a72e43128d495024364329517b801647812ce40

head               b84519867812a62c793e2a4b9b21a4978b1a5911

Named refs at pin: main ... HEAD

Read the diff:

git diff --find-renames 6a72e43128d495024364329517b801647812ce40 b84519867812a62c793e2a4b9b21a4978b1a5911

Commits:
- b845198 Accept a path or a compact hunk ref in hunkRefs.

Sources:
- ticket #94 Hunk refs are most of the written review.json. A path should cover a whole file, and that path stays valid when a rebase only shifts lines.
  https://github.com/matemolnar8/comprehende/issues/94

The title:

File-level hunk refs

The why:

[#94](source:s1) asks for a path when a group holds a whole file, and a compact hunk ref only when a file splits. Hunk refs are most of the review.json an agent writes.

The what (medium):

A hunkRefs entry can be a path, a compact hunk, or the existing object. Coverage expands a path to every live hunk of that file. The skeleton and the skill use paths.

Look for:
- [#94](source:s1) says a path must not drop live hunks. Coverage assigns every live hunk whose path matches, and a compact ref that misses git is stale.
- [#94](source:s1) says a file ref stays valid when a rebase only shifts lines. A path stores no oldStart or newStart, so a line shift does not make that ref stale.

## Review concerns

### 01 Hunk ref strings (`contract`)

Parse accepts a path, a compact hunk, or a hunk object, and stores a normalized ref.

[groups/contract.md](groups/contract.md)

### 02 Expand a path to live hunks (`coverage`)

joinCoverage expands a path to the live hunks of that file and matches a compact ref with hunkKey.

Depends on:
- 01 Hunk ref strings (`contract`)

[groups/coverage.md](groups/coverage.md)

### 03 Skeleton writes paths (`skeleton`)

review writes one path per changed file and reports the path count and the hunk count.

Depends on:
- 01 Hunk ref strings (`contract`)

[groups/skeleton.md](groups/skeleton.md)

### 04 Skill teaches the string forms (`skill`)

The hunk identity paragraph and example.md show a path for a whole file and path@oldStart+newStart for a split.

Depends on:
- 03 Skeleton writes paths (`skeleton`)

[groups/skill.md](groups/skill.md)

### 05 Synced skill copies (`copies`)

The .agents skill tree and the skills-next schema JSON match the edited skill and the generated schema.

Depends on:
- 04 Skill teaches the string forms (`skill`)

[groups/copies.md](groups/copies.md)