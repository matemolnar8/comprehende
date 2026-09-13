Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 8344a4a460d19d8216fedc94ac71f5c1866aa1a1` and `git rev-parse --verify f865bbb76de68ee5750ec0db3a02261094831d26` in this repository.
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

base (merge-base)  8344a4a460d19d8216fedc94ac71f5c1866aa1a1

head               f865bbb76de68ee5750ec0db3a02261094831d26

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 8344a4a460d19d8216fedc94ac71f5c1866aa1a1 f865bbb76de68ee5750ec0db3a02261094831d26

Commits:
- f865bbb Keep [ ] inside the current part after the group-nav rebase

Sources:
- ticket #69 Stay inside one story's dependsOn chain. Move between independent parts. Do not add a second stack metaphor.
  https://github.com/matemolnar8/comprehende/issues/69
- pr PR #75 Merged onto #73 with the header group pager. [ ] still crossed parts. StoryNav remained a second pager on the group page.
  https://github.com/matemolnar8/comprehende/pull/75

The title:

Keep [ ] inside the current part

The why:

[#69](source:s1) asked to stay inside one story for `[` `]` and hop independent parts with `{` `}`. [#75](source:s2) landed on #73 with the header pager, but `[` `]` still walked every group and the group page kept a second prev/next bar.

The what (small):

`[` `]` walk `dependsOn` order inside the current part, including Overview at the start of that walk. `{` `}` hop independent parts. Depends on and Needed by stay click hops. The group-page pager is gone.

## Review concerns

### 01 Scope [ ] to the current part (`part-walk`)

`neighborSelection` walks Overview plus the current part in `dependsOn` order. From Overview that is the first part. `{` `}` still hop parts.

[groups/part-walk.md](groups/part-walk.md)

### 02 Drop the group-page pager (`drop-pager`)

`StoryNav` is removed. `storyNav` only lists Depends on and Needed by hops. `GroupBrief` keeps those links and the lookFor lane from #76.

Depends on:
- 01 Scope [ ] to the current part (`part-walk`)

[groups/drop-pager.md](groups/drop-pager.md)