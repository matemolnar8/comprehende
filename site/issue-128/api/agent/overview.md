Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ecdb0465c3de7404d9a9571209bb1ac2f1e7ff20` and `git rev-parse --verify 17cb247c8b6d3c9af1f6d0c921367ad874e1ef5a` in this repository.
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

base (merge-base)  ecdb0465c3de7404d9a9571209bb1ac2f1e7ff20

head               17cb247c8b6d3c9af1f6d0c921367ad874e1ef5a

Named refs at pin: ecdb0465c3de7404d9a9571209bb1ac2f1e7ff20 ... 17cb247c8b6d3c9af1f6d0c921367ad874e1ef5a

Read the diff:

git diff --find-renames ecdb0465c3de7404d9a9571209bb1ac2f1e7ff20 17cb247c8b6d3c9af1f6d0c921367ad874e1ef5a

Commits:
- 17cb247 Label dependents as Needed by
- f4700b2 Navigate parts and dependsOn in the review UI

Sources:
- ticket #69 Jumping story-order through the UI is weak or missing.
  https://github.com/matemolnar8/comprehende/issues/69
- pr PR #75 One group pager walks overview then groups in part and dependsOn order. { and } hop independent parts.
  https://github.com/matemolnar8/comprehende/pull/75
- pr-comment cursor on PR #75 The thread is resolved and outdated. Head ranks a part by the earliest suggestedOrder.
  https://github.com/matemolnar8/comprehende/pull/75#discussion_r3999143775

The title:

Navigate parts / stories via dependsOn

The why:

[#69](source:s1) says jumping story-order through the UI is weak or missing.

The what (medium):

The UI walks groups in part and dependsOn order. A mixed review hops between independent parts.

## Review concerns

### 01 Part order (`order`)

groupParts orders groups inside a part with dependsOn, and ranks each part by the earliest suggestedOrder.

[groups/order.md](groups/order.md)

### 02 Story walk (`walk`)

[ and ] walk the current part. { and } hop parts when the review is mixed.

Depends on:
- 01 Part order (`order`)

[groups/walk.md](groups/walk.md)

### 03 Story controls (`chrome`)

StoryNav offers those hops, and the sidebar lists groups under their part.

Depends on:
- 02 Story walk (`walk`)

[groups/chrome.md](groups/chrome.md)