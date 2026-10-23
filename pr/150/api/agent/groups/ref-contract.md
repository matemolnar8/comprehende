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

Review concern 01 of 07: A hunk ref can be a directory (`ref-contract`)

Part: Directory refs

The why:

Coverage, refresh, the UI, and the eval checks all read refs through this contract, so it comes first.

The what:

`DirHunkRef` joins `ReviewHunkRef` in `identity.ts`, `refCoversPath` says whether one ref covers a path, `groupsHoldingPath` says which groups hold a path (a path or hunk ref beats a directory ref, the deepest directory wins), and the schema in `review.ts` accepts a string ending in `/`.

Hunk refs for this concern:
- src/schema/identity.ts
- src/schema/identity.test.ts
- src/schema/review.ts
- src/schema/parse.test.ts