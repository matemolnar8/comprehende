Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8` and `git rev-parse --verify 046cae0b9eba180c36d3e474dd24e1d9aff78852` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames 10dbe412c81b50b7b8c60b3bbbb87c2ce345a0c8 046cae0b9eba180c36d3e474dd24e1d9aff78852 -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
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

Review concern 03 of 07: Digest and draft collapse a mechanical directory (`digest-collapse`)

Part: Directory refs

The why:

[The 190-file digest was 27 kB and the draft 23 kB, past what one tool result shows](source:s2); one line per mechanical directory brings them to a third.

The what:

`mechanicalDirs` in `digest.ts` finds a directory whose changed files are all mechanical with at least half pure renames and prints it as one `DigestDir` line, `pregroup` in `commands.ts` writes it as one `dir/` ref and one path per other file, and the `mirrorOf` hint reads `same change as` because [it marks the same added and removed lines, not an identical file](source:s5).

Depends on:
- 01 A hunk ref can be a directory (`ref-contract`)

Hunk refs for this concern:
- src/review/digest.ts
- src/review/digest.test.ts
- src/cli/commands.ts
- src/cli/commands.test.ts
- src/cli/args.ts
- README.md