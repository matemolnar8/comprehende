Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 587e7aebf3074a2288cf7bee6eacfddba4bb3073` and `git rev-parse --verify bb865b7baa24a3c16de3c9282e41c4d095c15628` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 587e7aebf3074a2288cf7bee6eacfddba4bb3073 bb865b7baa24a3c16de3c9282e41c4d095c15628 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  587e7aebf3074a2288cf7bee6eacfddba4bb3073

head               bb865b7baa24a3c16de3c9282e41c4d095c15628

Named refs at pin: 587e7aeb ... bb865b7b

Read the diff:

git diff --find-renames 587e7aebf3074a2288cf7bee6eacfddba4bb3073 bb865b7baa24a3c16de3c9282e41c4d095c15628

Review concern 02 of 08: Header, sidebar, and navigation (`shell`)

The why:

Máté asks for the favicon as the app's icon and an easy sidebar collapse button [session](source:s2). The rest of the shell follows the design reviews of the same session.

The what:

`Header` holds the favicon `Logo`, the `SidebarButton` that collapses the sidebar panel in `App`, the new `DisplayMenu`, and `GroupNav`, whose arrows follow `neighborSelection` in `selection.ts`.

Attention (product):
`neighborSelection` in `selection.ts` now walks `groupWalk`, every group of every part. It used to stay inside the current part (`partWalk`, removed). So `]` and the header arrow on a part's last group now open the next part's first group, and `{` and `}` still jump part to part.

Questions:
- Why does the header `SidebarButton` collapse the sidebar without saving it, while a drag-collapse is saved by `useDefaultLayout`?

Depends on:
- 01 Shared controls and tokens (`controls`)

Hunk refs for this concern:
- src/ui/App.tsx
- src/ui/components/Header.tsx
- src/ui/components/GroupNav.tsx
- src/ui/components/DisplayMenu.tsx
- src/ui/components/MobileShell.tsx
- src/ui/components/Sidebar.tsx
- src/ui/components/Logo.tsx
- src/ui/components/ReviewStage.tsx
- src/ui/lib/selection.ts
- src/ui/lib/selection.test.ts
- src/ui/lib/parts.ts
- src/ui/lib/parts.test.ts