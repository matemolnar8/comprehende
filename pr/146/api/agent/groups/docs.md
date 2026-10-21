Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ae1bc763799faf6e9cb24702f6267c2807d6d72f` and `git rev-parse --verify 98f0fc86e7a373cabf4c55004f7e66825a40b5a6` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames ae1bc763799faf6e9cb24702f6267c2807d6d72f 98f0fc86e7a373cabf4c55004f7e66825a40b5a6 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  ae1bc763799faf6e9cb24702f6267c2807d6d72f

head               98f0fc86e7a373cabf4c55004f7e66825a40b5a6

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames ae1bc763799faf6e9cb24702f6267c2807d6d72f 98f0fc86e7a373cabf4c55004f7e66825a40b5a6

Review concern 05 of 06: README and glossary (`docs`)

The why:

The CLI gains a command and `source` gains fields, so the user-facing docs name them.

The what:

`README.md` adds `comprehende refresh` to the CLI section and `docs/glossary.md` defines Refresh and lists the full command set.

Depends on:
- 03 The refresh command and the drift note (`cli`)

Hunk refs for this concern:
- README.md
- docs/glossary.md