Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ecdb0465c3de7404d9a9571209bb1ac2f1e7ff20` and `git rev-parse --verify 17cb247c8b6d3c9af1f6d0c921367ad874e1ef5a` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames ecdb0465c3de7404d9a9571209bb1ac2f1e7ff20 17cb247c8b6d3c9af1f6d0c921367ad874e1ef5a -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
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

Review concern 02 of 03: Story walk (`walk`)

Part: Story navigation

The why:

[#69](source:s1) asks to move between independent parts, and to stay inside one story's dependsOn chain.

The what:

[ and ] walk the current part. { and } hop parts when the review is mixed.

Depends on:
- 01 Part order (`order`)

Hunk refs for this concern:
- src/ui/lib/selection.ts
- src/ui/lib/selection.test.ts
- src/ui/App.tsx