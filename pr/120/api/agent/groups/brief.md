Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3` and `git rev-parse --verify 6e9be6a93e1c6c0a1b7ba05479fcd609abccc3ec` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3 6e9be6a93e1c6c0a1b7ba05479fcd609abccc3ec -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  732a01b08eaa2f79562ea4e2ef76e38c9d92eee3

head               6e9be6a93e1c6c0a1b7ba05479fcd609abccc3ec

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3 6e9be6a93e1c6c0a1b7ba05479fcd609abccc3ec

Review concern 01 of 02: Brief, sources, and the file count (`brief`)

Part: Review layout

The why:

[This session](source:s1) asks to cap the brief, put a kind on each source, and show one file total. A skipped binary is named on the overview.

The what:

The brief measure wraps Why, What, and Look for. Each field name sits above its text. A source shows its text first. The kind and the name sit under that text. The overview kicker and the header reading mark both use the grouped file paths. A skipped binary is named in an info card on that kicker.

Hunk refs for this concern:
- src/ui/components/GroupBrief.tsx
- src/ui/components/Kicker.tsx
- src/ui/components/Header.tsx
- src/ui/components/Overview.tsx
- src/ui/components/SourceList.tsx
- src/ui/lib/reading-progress.ts
- src/ui/lib/reading-progress.test.ts