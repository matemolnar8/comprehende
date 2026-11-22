Answer questions about this review concern.

## Steps

When no question follows this paste, explain this review concern.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify e7e5bb1f22cfd022535d1b8a31880f0b045acf64` and `git rev-parse --verify 4b0585cd17d8bc17a13958e6a61bf6f5288a1d1d` in this repository.
   Done when both objects exist.

2. Load the hunks.
   A hunk ref is a pointer into the live git diff at the pinned SHAs.
   For each hunk ref, run `git diff --find-renames e7e5bb1f22cfd022535d1b8a31880f0b045acf64 4b0585cd17d8bc17a13958e6a61bf6f5288a1d1d -- <path>` and keep the hunk whose header matches the @@ range.
   Done when every hunk ref has a matching live hunk.

3. Answer from live git.
   Read those hunks. Use the why and the what as interpretation. Live git wins when they disagree.
   When you show code, quote the live git lines.
   Done when the answer quotes the live code.

## Pin

Repository: comprehende
Origin: git@github.com:matemolnar8/comprehende.git

base (merge-base)  e7e5bb1f22cfd022535d1b8a31880f0b045acf64

head               4b0585cd17d8bc17a13958e6a61bf6f5288a1d1d

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames e7e5bb1f22cfd022535d1b8a31880f0b045acf64 4b0585cd17d8bc17a13958e6a61bf6f5288a1d1d

Review concern 02 of 06: Rounds and answer codes (`round`)

Part: Taste Lab

The what:

`round.ts` hashes the cards into a round id and reads the page's answer code back into picks and a tally.

Attention (contract):
The code `taste.<id>.<duels>.<ideas>` is the only link between `page.html` and `readCode`. The id is the first 8 hex characters of a SHA-1 over every card text, so `readCode` refuses a code whose id, length, or letters do not match `round.json`. Duel letters are `x y s n -`; idea letters are `y n -`.

Depends on:
- 01 Duel cards from two reviews (`cards`)

Hunk refs for this concern:
- scripts/taste/round.ts
- scripts/taste/round.test.ts