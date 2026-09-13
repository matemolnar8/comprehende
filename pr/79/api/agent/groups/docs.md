Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 8344a4a460d19d8216fedc94ac71f5c1866aa1a1` and `git rev-parse --verify 975dd4ec32ab0bb3bfd68cc753683e2cefa04430` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 8344a4a460d19d8216fedc94ac71f5c1866aa1a1 975dd4ec32ab0bb3bfd68cc753683e2cefa04430 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  8344a4a460d19d8216fedc94ac71f5c1866aa1a1

head               975dd4ec32ab0bb3bfd68cc753683e2cefa04430

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 8344a4a460d19d8216fedc94ac71f5c1866aa1a1 975dd4ec32ab0bb3bfd68cc753683e2cefa04430

Review concern 03 of 03: README names the hashes; export stays one shell (`docs`)

Part: Hash route

The why:

People who share a review need to know the hash names. Export must keep the same UI as serve.

The what:

README lists `#overview`, `#group/<id>`, `#unassigned`, and `#lockfiles`. The export test still asserts that serve and export return the same `index.html`.

Hunk refs for this concern:
- README.md @@ -42,7 +42,7 @@
- src/api/export.test.ts @@ -58,6 +58,12 @@