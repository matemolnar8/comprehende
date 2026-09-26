Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify eeff1bec234553b38b2a04e41df8988e9c343ec9` and `git rev-parse --verify 3f11252aa9716996d9c60fe581df65972569abc2` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames eeff1bec234553b38b2a04e41df8988e9c343ec9 3f11252aa9716996d9c60fe581df65972569abc2 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  eeff1bec234553b38b2a04e41df8988e9c343ec9

head               3f11252aa9716996d9c60fe581df65972569abc2

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames eeff1bec234553b38b2a04e41df8988e9c343ec9 3f11252aa9716996d9c60fe581df65972569abc2

Review concern 01 of 02: Brief, sources, and the file count (`brief`)

Part: Review layout

The why:

[This session](source:s1) asks to cap the brief, name each source, and show one file total. A skipped binary is named on the overview.

The what:

Why, What, and Look for stay near 68 characters, and each field name sits above that text. A source shows its gist first. The kind and the name sit under the gist. The header and the overview kicker share one file count. A skipped binary is an info card on the kicker.

Hunk refs for this concern:
- src/ui/components/GroupBrief.tsx
- src/ui/components/Header.tsx
- src/ui/components/Kicker.tsx
- src/ui/components/Overview.tsx
- src/ui/components/SourceList.tsx
- src/ui/lib/reading-progress.test.ts
- src/ui/lib/reading-progress.ts