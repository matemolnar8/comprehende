Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3` and `git rev-parse --verify 85ce2e531e3d02f615ca887bcdf3ebf762faee8b` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3 85ce2e531e3d02f615ca887bcdf3ebf762faee8b -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  732a01b08eaa2f79562ea4e2ef76e38c9d92eee3

head               85ce2e531e3d02f615ca887bcdf3ebf762faee8b

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3 85ce2e531e3d02f615ca887bcdf3ebf762faee8b

Review concern 02 of 02: File rail and hunk rows (`diff-rail`)

Part: Review layout

The why:

[This session](source:s1) asks to drop the rail for one file, start it collapsed under about 1100px, and keep hunks as rounded blocks.

The what:

A group with one file renders the hunk alone. A wider multi-file group keeps a narrower rail. Hunk blocks are rounded and have a border, with no shadow. The active file's border is primary only when another file is in the group.

Look for:
- Subtle. Under 1099px the rail starts collapsed only when storage has no choice. A stored open value, or ?rail=open, keeps the rail open.

Hunk refs for this concern:
- src/ui/components/FileNav.tsx
- src/ui/components/Group.tsx
- src/ui/components/HunkView.tsx
- src/ui/lib/file-nav.ts
- src/ui/lib/file-nav.test.ts