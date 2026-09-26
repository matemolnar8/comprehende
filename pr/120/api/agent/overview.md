Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify eeff1bec234553b38b2a04e41df8988e9c343ec9` and `git rev-parse --verify 3f11252aa9716996d9c60fe581df65972569abc2` in this repository.
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
Origin: https://github.com/matemolnar8/comprehende

base (merge-base)  eeff1bec234553b38b2a04e41df8988e9c343ec9

head               3f11252aa9716996d9c60fe581df65972569abc2

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames eeff1bec234553b38b2a04e41df8988e9c343ec9 3f11252aa9716996d9c60fe581df65972569abc2

Commits:
- 3f11252 Merge branch 'cursor/review-ui-edges-d65b' of https://github.com/matemolnar8/comprehende into cursor/review-ui-edges-d65b
- df598c4 Keep the hunk path button on the path text.
- 10df865 Merge branch 'main' into cursor/review-ui-edges-d65b
- 6e9be6a Put brief field names above their text.
- 85ce2e5 Lead each source with its text, and put the kind and name under it.
- 21d6424 Hide skipped binaries behind an info card on the overview kicker.
- d8658c1 Drop the hunk count, give sources the brief width, and round hunk blocks.
- 857ca7f Tighten review layout around the brief, the file rail, and hunk rows.

Sources:
- transcript Cursor session · Sep 26 Apply the approved audit, then correct the header, the sources, the field headings, and the hunk click.
- pr-comment cursor[bot] on PR #120

The title:

Tighten the review layout

The why:

[This session](source:s1) asks to apply the approved audit to the fixed review UI.

The what (small):

The brief stacks each field name above its text and caps Why, What, and Look for near 68 characters. A source leads with its gist. The header drops the hunk count. A skipped binary is an info card. Hunk blocks are rounded. A click on the header gap collapses the file.

## Review concerns

### 01 Brief, sources, and the file count (`brief`)

Why, What, and Look for stay near 68 characters, and each field name sits above that text. A source shows its gist first. The kind and the name sit under the gist. The header and the overview kicker share one file count. A skipped binary is an info card on the kicker.

[groups/brief.md](groups/brief.md)

### 02 File rail and hunk rows (`diff-rail`)

A group with one file renders the hunk alone. A multi-file group keeps a narrower rail. Hunk blocks are rounded and have a border, with no shadow. The path control stays as wide as the path, so a click on the header gap collapses the file.

[groups/diff-rail.md](groups/diff-rail.md)