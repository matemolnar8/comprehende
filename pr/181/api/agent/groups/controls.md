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

Review concern 01 of 08: Shared controls and tokens (`controls`)

The why:

Enables the shell, brief, files, and diff groups: they use these controls, so one control looks and acts the same on every screen.

The what:

The new `Segmented`, `ViewedToggle`, and `DiffStat` components and the extra `Badge` and menu variants draw on the colour tokens in `styles.css`, which the later groups reuse.

Hunk refs for this concern:
- src/ui/components/ui/segmented.tsx
- src/ui/components/ui/badge.tsx
- src/ui/components/ui/dropdown-menu.tsx
- src/ui/components/ui/resizable.tsx
- src/ui/components/Kbd.tsx
- src/ui/components/ViewedToggle.tsx
- src/ui/components/DiffStat.tsx
- src/ui/components/ReadingMark.tsx
- src/ui/lib/reading-progress.ts
- src/ui/lib/reading-progress.test.ts
- src/ui/lib/scroll-edges.ts
- src/ui/lib/scroll-edges.test.ts
- src/ui/styles.css
- src/ui/lib/ThemeProvider.tsx