Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify b6874adce51508c7d7d48118445146e7b93d5d1a` and `git rev-parse --verify dab1e44dc86529cf9d3f90ebc62ec1c59e4a92dd` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames b6874adce51508c7d7d48118445146e7b93d5d1a dab1e44dc86529cf9d3f90ebc62ec1c59e4a92dd -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
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

Review concern 04 of 04: Iosevka as a stored mono choice (`iosevka`)

Part: Mono font choice

The why:

The user asked to bundle Iosevka as a mono font with a subtle toggle, stored in storage [the session](source:s1).

The what:

main.tsx imports @fontsource/iosevka, mono-font.ts and MonoFontProvider hold the stored choice, and an Aa button beside the theme toggle in both headers switches --font-mono.

Look for:
- The Iosevka latin woff2 is about 1 MB per weight. The browser downloads it only when Iosevka first applies, because the Aa glyph renders in the current mono font.

Hunk refs for this concern:
- package.json
- src/ui/main.tsx
- src/ui/lib/mono-font.ts
- src/ui/lib/mono-font.test.ts
- src/ui/lib/MonoFontProvider.tsx
- src/ui/components/Header.tsx
- src/ui/components/MobileShell.tsx