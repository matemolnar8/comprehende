Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 64c573619923b163e1bb2313bab69384ff71083e` and `git rev-parse --verify d86dd9523f70c2245948726ae8a7ea36aaf31b5f` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 64c573619923b163e1bb2313bab69384ff71083e d86dd9523f70c2245948726ae8a7ea36aaf31b5f -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  64c573619923b163e1bb2313bab69384ff71083e

head               d86dd9523f70c2245948726ae8a7ea36aaf31b5f

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 64c573619923b163e1bb2313bab69384ff71083e d86dd9523f70c2245948726ae8a7ea36aaf31b5f

Review concern 04 of 07: The What changed page (`changes-page`)

Part: What changed

The why:

The user asked for a comparison that stays out of the way and opens only when intended ([session](source:s2)).

The what:

A new `changes` selection renders `Changes.tsx`, reached from a link in the Overview kicker, the `h` key in `App.tsx`, and the `#changes` hash, which falls back to the Overview when the review has no `changes`.

Depends on:
- 02 The changes payload (`changes-payload`)

Hunk refs for this concern:
- src/ui/components/Changes.tsx
- src/ui/components/Overview.tsx@14+14
- src/ui/components/Overview.tsx@47+50
- src/ui/components/Overview.tsx@65+70
- src/ui/components/ReviewStage.tsx@5+5
- src/ui/components/ReviewStage.tsx@62+63
- src/ui/App.tsx
- src/ui/lib/selection.ts@4+4
- src/ui/lib/selection.ts@42+44
- src/ui/lib/selection.ts@70+75
- src/ui/lib/selection.ts@114+116
- src/ui/lib/selection.ts@156+161
- src/ui/lib/selection.ts@239+245
- src/ui/lib/selection.ts@272+272
- src/ui/lib/selection.test.ts
- README.md@52+52
- README.md@98+98