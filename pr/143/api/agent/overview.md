Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify b6874adce51508c7d7d48118445146e7b93d5d1a` and `git rev-parse --verify dab1e44dc86529cf9d3f90ebc62ec1c59e4a92dd` in this repository.
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

base (merge-base)  b6874adce51508c7d7d48118445146e7b93d5d1a

head               dab1e44dc86529cf9d3f90ebc62ec1c59e4a92dd

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames b6874adce51508c7d7d48118445146e7b93d5d1a dab1e44dc86529cf9d3f90ebc62ec1c59e4a92dd

Commits:
- dab1e44 Shrink diffs on mobile and add Iosevka mono toggle

Sources:
- transcript T3 session · Oct 17 User reported mobile diffs stay large and asked for T3-style mobile diffs, then asked to bundle Iosevka with a subtle stored toggle.

The title:

Smaller diffs on mobile, plus an Iosevka toggle

The why:

The user reports that on mobile the diffs do not get smaller, unlike the sections above them [the session](source:s1).

The what (small):

Diff text and file headers scale down on narrow screens, and lines wrap there by default. An Aa toggle beside the theme toggle switches code text between IBM Plex Mono and bundled Iosevka, stored locally.

## Review concerns

### 01 Diff text scales down on mobile (`diff-scale`)

styles.css steps --diff-font-size and --diff-line-height down at 799px, a diffs-container host rule carries them into Pierre, and the mobile gutter slims with them.

[groups/diff-scale.md](groups/diff-scale.md)

### 02 Narrow screens wrap diff lines by default (`narrow-wrap`)

resolveWrap in narrow.ts defaults wrap on when the screen is narrow, an explicit toggle still wins, and App holds that override.

[groups/narrow-wrap.md](groups/narrow-wrap.md)

### 03 File header gets quiet on mobile (`file-header`)

The filename drops to 12px on narrow screens and the hunk count label hides there; the change counts stay.

[groups/file-header.md](groups/file-header.md)

### 04 Iosevka as a stored mono choice (`iosevka`)

main.tsx imports @fontsource/iosevka, mono-font.ts and MonoFontProvider hold the stored choice, and an Aa button beside the theme toggle in both headers switches --font-mono.

[groups/iosevka.md](groups/iosevka.md)