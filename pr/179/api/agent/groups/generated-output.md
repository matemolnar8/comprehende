Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify db054c4f8b1d6ad8c9ed216cfc9dcfa7e43cd373` and `git rev-parse --verify 4bf5dbfbcaf8f57667667dbc294b465470cd38d2` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames db054c4f8b1d6ad8c9ed216cfc9dcfa7e43cd373 4bf5dbfbcaf8f57667667dbc294b465470cd38d2 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  db054c4f8b1d6ad8c9ed216cfc9dcfa7e43cd373

head               4bf5dbfbcaf8f57667667dbc294b465470cd38d2

Named refs at pin: db054c4f ... 4bf5dbfb

Read the diff:

git diff --find-renames db054c4f8b1d6ad8c9ed216cfc9dcfa7e43cd373 4bf5dbfbcaf8f57667667dbc294b465470cd38d2

Review concern 01 of 03: Generated output the CLI misses (`generated-output`)

The why:

Failing producers put the schema with the code because the CLI did not flag it as generated [PR](source:s2).

The what:

The mechanical bullet in Grouping rules now makes generated output the CLI missed its own group when the diff shows the generator, with a summary that says whether the output matches the code at head.

Attention (tradeoff):
A file such as a checked-in schema now leaves the group of the code it comes from, so the reader checks it in a separate group. The rule fires only when the diff shows the generator or build step, so a hand-written schema with no such step stays with its story. Output that does not match its code must not get a skip summary.

Hunk refs for this concern:
- skills-next/comprehende/SKILL.md@176+176