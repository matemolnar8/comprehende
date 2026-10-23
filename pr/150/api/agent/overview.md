Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8` and `git rev-parse --verify 046cae0b9eba180c36d3e474dd24e1d9aff78852` in this repository.
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

base (merge-base)  10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8

head               046cae0b9eba180c36d3e474dd24e1d9aff78852

Named refs at pin: 10dbe41 ... 046cae0

Read the diff:

git diff --find-renames 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8 046cae0b9eba180c36d3e474dd24e1d9aff78852

Commits:
- 046cae0 One path-ownership rule for pins, What changed, and eval checks
- f98a41c Skill: keep the 'Do not run that command' sentence
- a19cd26 Digest: 'same change as', not 'identical copy'; sources capped at 10 kB
- aa9caae Skill: the write step names both lookFor fields
- 3031fcf Skill: apply the writing review
- 95cdfa6 Skill: a digest of up to six files fetches every readable file
- 429eb6e Skill: read sources whole, log base..head, validate in the write call
- 885f5d5 Directory refs: the most specific ref wins
- 2ad3035 Directory hunk refs; sources ride in the step-2 call

Sources:
- transcript Claude Code session · Oct 2026 Máté asked to speed up review generation, then to focus on medium and small PRs with speed and token use as the metrics, to review the skill text for a smaller model, and to make it work with Haiku 5.5.
- commit Directory hunk refs; sources ride in the step-2 call A ref ending in / covers a directory; the digest collapses a mechanical directory with at least five pure renames; the draft holds one path per file; the step-2 output no longer gets truncated.
- commit Directory refs: the most specific ref wins Fixes from review: a path ref beats a directory ref, validate fails a non-mechanical file under a directory ref, refresh drafts new hunks under a directory ref, old-side pins on renamed files, the What changed page lists directory files, collapse needs half the files to be pure renames.
- commit Skill: apply the writing review Steps in run order, one fetch rule, pins defined by base and head file, a PR comment is a source only when cited or pinned, duplicated rules gone.
- commit Digest: 'same change as', not 'identical copy'; sources capped at 10 kB The mirrors hint marks the same added and removed lines, not identical files; Claude Code shows at most 30 kB of one shell result.

The title:

Speed up review generation: directory refs and a leaner skill

The why:

[Reviews take too long and spend too many tokens on the medium and small PRs that make up most of the reports](source:s1), and on a 190-file PR [the step-2 output got truncated](source:s2).

The what (large):

A hunk ref can name a directory, so the digest and draft of a large PR shrink to one line per mechanical directory, and the skill runs in three tool calls with sources, log, and validate folded into them.

Look for:
- [The first directory-ref commit](source:s2) collapses a directory with at least five pure renames; [the follow-up](source:s3) changes that rule to at least half of the directory's files, and the skill text says the same.
- [The session asked for speed and token use on medium and small PRs](source:s1). Measured on the eval cases, the skill changes give about 1.3x on small PRs and the directory refs cut a 190-file digest to a third; the writing rewrite itself is speed-neutral and holds the graded quality.

## Review concerns

### 01 A hunk ref can be a directory (`ref-contract`)

`DirHunkRef` joins `ReviewHunkRef` in `identity.ts`, `refCoversPath` says whether one ref covers a path, `groupsHoldingPath` says which groups hold a path (a path or hunk ref beats a directory ref, the deepest directory wins), and the schema in `review.ts` accepts a string ending in `/`.

[groups/ref-contract.md](groups/ref-contract.md)

### 02 Coverage: the most specific ref wins (`coverage`)

`dirOwners` in `coverage.ts` gives each live hunk to the path ref that names it, else to the deepest directory ref, and `dirRefErrors` fails a directory ref that holds a file that is not mechanical; `checks.ts` applies `groupsHoldingPath` for the eval together and apart checks, and the server and covering-document tests carry a directory ref.

Depends on:
- 01 A hunk ref can be a directory (`ref-contract`)

[groups/coverage.md](groups/coverage.md)

### 03 Digest and draft collapse a mechanical directory (`digest-collapse`)

`mechanicalDirs` in `digest.ts` finds a directory whose changed files are all mechanical with at least half pure renames and prints it as one `DigestDir` line, `pregroup` in `commands.ts` writes it as one `dir/` ref and one path per other file, and the `mirrorOf` hint reads `same change as` because [it marks the same added and removed lines, not an identical file](source:s5).

Depends on:
- 01 A hunk ref can be a directory (`ref-contract`)

[groups/digest-collapse.md](groups/digest-collapse.md)

### 04 Refresh keeps a directory ref (`refresh`)

`refreshDocument` in `refresh.ts` keeps a directory ref whose directory still has live hunks, reports the changed and reformatted hunks under it, and leaves new files under it to the `update` group.

Depends on:
- 02 Coverage: the most specific ref wins (`coverage`)

[groups/refresh.md](groups/refresh.md)

### 05 Pins on renamed files and the What changed list (`ui-renames`)

`groupIdForPinnedSource` in `source.ts` finds a pin's group through `groupsHoldingPath`, after `App.tsx` maps an `old` pin on a renamed file to its head path; the API file entry carries `relocation` so a copy stays out of that map, and `groupPaths` in `changes.ts` lists on the What changed page only the files a directory ref holds under the same rule.

Depends on:
- 02 Coverage: the most specific ref wins (`coverage`)

[groups/ui-renames.md](groups/ui-renames.md)

### 06 Schema JSON copies (`schema-copies`)

The same one-line description of a hunk ref repeats in three generated JSON files; read one, skip the rest.

[groups/schema-copies.md](groups/schema-copies.md)

### 07 The skill in three tool calls (`skill`)

`skills-next/comprehende/SKILL.md` folds the source reads and `git log base..head` into the step-2 call, groups and fetches in one `show` call, writes `review.json` with a heredoc that ends in `validate`, names both `lookFor` fields in the write step, and caps each source at 10 kB; the `.agents` copies repeat it, `example.md` keeps the draft's `source` object, `skill.test.ts` and `skill-sync.test.ts` pin the wording, and the `Do not run that command` sentence stays because `install-local-skill.ts` rewrites it.

[groups/skill.md](groups/skill.md)