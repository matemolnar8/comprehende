Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 95879630ef53ba6bd6da25c6958a19fe06786fe0` and `git rev-parse --verify e55fb2c9294ff84b08f0e0d1b0aa7f5c158f0e06` in this repository.
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

base (merge-base)  95879630ef53ba6bd6da25c6958a19fe06786fe0

head               e55fb2c9294ff84b08f0e0d1b0aa7f5c158f0e06

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 95879630ef53ba6bd6da25c6958a19fe06786fe0 e55fb2c9294ff84b08f0e0d1b0aa7f5c158f0e06

Commits:
- 9587963 Merge pull request #74 from matemolnar8/cursor/writing-for-agents-skill-763a
- e55fb2c Navigate parts and dependsOn in the review UI
- 98d61ee Require writing-for-agents when editing the comprehende skill
- 1f13a23 Install writing-for-agents from mattpocock/skills

Sources:
- ticket #69 Make existing part and dependsOn usable for navigation. Stay in a story. Hop independent parts. Keep those words.
  https://github.com/matemolnar8/comprehende/issues/69
- pr PR #75 Existing fields drive reading order. No new grouping schema.
  https://github.com/matemolnar8/comprehende/pull/75

The title:

Navigate parts and dependsOn in the review UI

The why:

[#69](source:s1) already stores `part` and `dependsOn`. The UI did not use them to move through a story.

The what (small):

`groupParts` reads a story in `dependsOn` order. `[` `]` stay in that part. `{` `}` open the next independent part. The group page and sidebar follow the same graph.

Look for:
- [#69](source:s1) asks to stay inside one story. On the last group of a part, `]` does not open another part.
- [#69](source:s1) keeps forge stacks and renaming groups to stacks out of scope. No hunk adds those schema fields.

## Review concerns

### 01 Read a part in dependsOn order (`order`)

`groupParts` topological-sorts `dependsOn` inside a part, then `suggestedOrder`.

[groups/order.md](groups/order.md)

### 02 Previous, next, and next part (`hops`)

`storyNav` returns previous/next in the part and previousPart/nextPart as the first group of the adjacent part.

Depends on:
- 01 Read a part in dependsOn order (`order`)

[groups/hops.md](groups/hops.md)

### 03 Keyboard stays in the story (`keys`)

`shiftStorySelection` walks `storyNav` previous/next. `shiftPartSelection` opens the first group of the adjacent part. `App.tsx` binds `[` `]` and `{` `}`.

Depends on:
- 02 Previous, next, and next part (`hops`)

[groups/keys.md](groups/keys.md)

### 04 Group pager and Then links (`pager`)

`StoryNav` is the prev/next row. `GroupBrief` links Depends on and Then, then renders that pager.

Depends on:
- 02 Previous, next, and next part (`hops`)

[groups/pager.md](groups/pager.md)

### 05 Overview and sidebar by part (`map`)

Overview columns and the sidebar list groups under each `part`, in the `dependsOn` order from `groupParts`.

Depends on:
- 01 Read a part in dependsOn order (`order`)

[groups/map.md](groups/map.md)

### 06 Order, hops, and key tests (`tests`)

`parts.test.ts`, `story-nav.test.ts`, and `selection.test.ts` cover dependsOn order, part hops, and `[` `]` staying in a part.

Depends on:
- 03 Keyboard stays in the story (`keys`)

[groups/tests.md](groups/tests.md)