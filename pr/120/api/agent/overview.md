Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3` and `git rev-parse --verify d8658c1681fc92d4fa0a6d11218095be343f5219` in this repository.
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

base (merge-base)  732a01b08eaa2f79562ea4e2ef76e38c9d92eee3

head               d8658c1681fc92d4fa0a6d11218095be343f5219

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames 732a01b08eaa2f79562ea4e2ef76e38c9d92eee3 d8658c1681fc92d4fa0a6d11218095be343f5219

Commits:
- d8658c1 Drop the hunk count, give sources the brief width, and round hunk blocks.
- 857ca7f Tighten review layout around the brief, the file rail, and hunk rows.

Sources:
- transcript Cursor session · Sep 26 Implement the approved audit: cap the brief, drop the single-file rail, flatten hunk cards, align the file count, and tighten the multi-file rail. Keep the story boxes and only lower their tint.

The title:

Tighten the review layout

The why:

[This session](source:s1) asks to apply the approved audit to the fixed review UI.

The what (small):

Why, What, and Look for stop near 68 characters. Sources use the full brief width. The header and the overview kicker share one file count. A skipped binary is a grey line on the overview, and only when a file was skipped. A one-file group has no file rail. Hunk blocks are rounded, with no shadow. A multi-file rail is narrower.

## Review concerns

### 01 Brief, sources, and the file count (`brief`)

The brief measure wraps Why, What, and Look for. Sources use the full brief width. The overview kicker and the header reading mark both use the grouped file paths. A skipped binary is a grey line under that kicker.

[groups/brief.md](groups/brief.md)

### 02 File rail and hunk rows (`diff-rail`)

A group with one file renders the hunk alone. A wider multi-file group keeps a narrower rail. Hunk blocks are rounded and have a border, with no shadow. The active file's border is primary only when another file is in the group.

[groups/diff-rail.md](groups/diff-rail.md)