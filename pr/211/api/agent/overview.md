Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify fe03571cd177e5f7f16352b0b4b68b39721b2e56` and `git rev-parse --verify 1671733faea758db55156ed744d7c515324a5610` in this repository.
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
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  fe03571cd177e5f7f16352b0b4b68b39721b2e56

head               1671733faea758db55156ed744d7c515324a5610

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames fe03571cd177e5f7f16352b0b4b68b39721b2e56 1671733faea758db55156ed744d7c515324a5610

Commits:
- 1671733f Image diffs: load pixels near the screen, diff them in a worker
- 5ee07e6f Serve: read the pinned diff once, not on every request

Sources:
- transcript Claude Code session · Nov 25 100 screenshots in one group lag; reach 60 fps, same UX.

The title:

Image diffs stay at 60 fps with 100 screenshots in one group

The why:

With hundreds of screenshot diffs in one group, [image sliders lagged and the review was slow](source:s1), locally and hosted.

The what (medium):

`serve` reads the pinned diff once, and image cards load pixels near the screen and diff them in a worker.

Things to check:
- The [session](source:s1) asks for no change to the user experience. At head, a card that has not loaded yet shows an empty frame at the first image's size with a hidden caption, and in Pixel diff each canvas fills when its worker job ends, about 0.3 s per pair.

## Review concerns

### 01 Cache the pinned diff (`diff-cache`)

`readDiff` keeps the promise for a pair of full SHAs, so every `serve` request after the first reuses one diff.

Attention (contract):
`readDiff` now returns one shared array for the same SHA pair, typed `readonly DiffFile[]`. The type stops a caller from pushing or sorting the array, but not from changing a `DiffFile` inside it: such a write would show in every later request until the process ends. No caller writes to a `DiffFile` at head.

[groups/diff-cache.md](groups/diff-cache.md)

### 02 Accept the readonly diff (`readonly-callers`)

Each function that takes the diff now takes `readonly DiffFile[]`. The reader can skip it: only parameter types change.

[groups/readonly-callers.md](groups/readonly-callers.md)

### 03 Load images near the screen (`lazy-cards`)

`ImageDiff` loads a card's images when it comes within 1.5 screens, or when an idle queue in `near-viewport.ts` reaches it.

Attention (tradeoff):
A card keeps its images after it scrolls away, and the idle queue loads every remaining card one at a time. So a 100-card group still ends with all images loaded, as before; the gain is that the cards on screen load first and nothing loads during a scroll. Unmounting far images instead made returning cards fetch again, because `serve` sends image URLs with `no-store`, and showed empty frames.

[groups/lazy-cards.md](groups/lazy-cards.md)

### 04 Pixel diff in a worker (`pixel-worker`)

`PixelStage` asks `queuePixelDiff` for a bitmap, and the worker fetches both images and runs the same `diffRgba`.

Attention (risk):
The worker needs `OffscreenCanvas` and `createImageBitmap` (Safari 16.4+, Firefox 105+). In an older browser the job fails, and the card shows "The pixels could not be compared" where the main-thread diff worked before. Only cards near the screen get a job, and a job that has not started is dropped when its card scrolls away.

Depends on:
- 03 Load images near the screen (`lazy-cards`)

[groups/pixel-worker.md](groups/pixel-worker.md)