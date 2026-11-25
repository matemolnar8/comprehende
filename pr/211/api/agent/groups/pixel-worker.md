Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify fe03571cd177e5f7f16352b0b4b68b39721b2e56` and `git rev-parse --verify 5485056e4c2fd250bc5c751de58acdc001afec6f` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames fe03571cd177e5f7f16352b0b4b68b39721b2e56 5485056e4c2fd250bc5c751de58acdc001afec6f -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  fe03571cd177e5f7f16352b0b4b68b39721b2e56

head               5485056e4c2fd250bc5c751de58acdc001afec6f

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames fe03571cd177e5f7f16352b0b4b68b39721b2e56 5485056e4c2fd250bc5c751de58acdc001afec6f

Review concern 04 of 04: Pixel diff in a worker (`pixel-worker`)

Part: Image cards

The what:

`PixelStage` hands the loaded Blobs to `queuePixelDiff`, and the worker decodes them and runs the same `diffRgba`.

Attention (risk):
The worker needs `OffscreenCanvas` and `createImageBitmap` (Safari 16.4+, Firefox 105+). In an older browser the job fails, and the card shows "The pixels could not be compared" where the main-thread diff worked before. Only cards near the screen get a job, and a job that has not started is dropped when its card scrolls away.

Depends on:
- 03 Load images by screen priority (`lazy-cards`)

Hunk refs for this concern:
- src/ui/lib/pixel-diff.ts
- src/ui/lib/pixel-diff.worker.ts
- src/ui/components/ImageDiff.tsx@9+9
- src/ui/components/ImageDiff.tsx@124+150
- src/ui/components/ImageDiff.tsx@377+414
- src/ui/components/ImageDiff.tsx@415+463
- src/ui/components/ImageDiff.tsx@507+530