Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify ae1bc763799faf6e9cb24702f6267c2807d6d72f` and `git rev-parse --verify e340814958bfa548fa7175750c2639ca225b0dca` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames ae1bc763799faf6e9cb24702f6267c2807d6d72f e340814958bfa548fa7175750c2639ca225b0dca -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  ae1bc763799faf6e9cb24702f6267c2807d6d72f

head               e340814958bfa548fa7175750c2639ca225b0dca

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames ae1bc763799faf6e9cb24702f6267c2807d6d72f e340814958bfa548fa7175750c2639ca225b0dca

Review concern 03 of 06: The refresh command and the drift note (`cli`)

The why:

[#88](source:s1) asks for a refresh path and a warning when the review no longer matches the commits. This group wires both into the CLI.

The what:

`cmdRefresh` in `src/cli/commands.ts` loads the document, resolves the refs again, diffs both ranges, writes the result, and returns the report; `sourceDrift` builds the note that `serve` and `export` print in `src/cli/main.ts`; `src/cli/args.ts` adds the command and its usage text. Two fixes from the simulation runs ride along: `cmdShow` keeps the old path of a renamed hunk ref, and `cmdPregroup` leaves lockfiles out of the draft.

Look for:
- `refresh` writes `review.json` before it prints the report. A run that finds both commits unchanged prints `nothing to refresh` and does not touch the file.
- The old range is read from `source.baseSha` and `source.headSha`; the new refs default to `source.baseRef` and `source.headRef`, so a document written for `origin/main...origin/feature` refreshes with no flags after `git fetch`.
- The drift note goes to stderr on `serve` and `export` only. `validate` stays silent about it.
- `show --hunk "old -> new@a+b"` used to print `no hunk matches` because `readPathDiff` got only the new path and git saw an added file. It now passes the old path too, so the ref `pregroup` and `refresh` write is the ref `show` reads.
- `pregroup` skipped lockfiles in the skeleton but still listed them in the draft groups through the digest. They are now skipped there as well, which matches the skill text.
- The hint after `refresh` says `Check the prose of the groups named above`, not `Rewrite`, because a group whose hunks only reformatted keeps its prose.

Depends on:
- 02 Match hunks across ranges and rewrite the refs (`refresh-engine`)

Hunk refs for this concern:
- src/cli/commands.ts
- src/cli/main.ts
- src/cli/args.ts
- src/cli/args.test.ts
- src/cli/commands.test.ts