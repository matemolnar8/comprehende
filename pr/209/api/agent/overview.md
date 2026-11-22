Answer questions about this git change.

## Steps

When no question follows this paste, explain this change.

1. Resolve the pinned SHAs.
   Run `git rev-parse --verify e7e5bb1f22cfd022535d1b8a31880f0b045acf64` and `git rev-parse --verify 4b0585cd17d8bc17a13958e6a61bf6f5288a1d1d` in this repository.
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

base (merge-base)  e7e5bb1f22cfd022535d1b8a31880f0b045acf64

head               4b0585cd17d8bc17a13958e6a61bf6f5288a1d1d

Named refs at pin: origin/main ... HEAD

Read the diff:

git diff --find-renames e7e5bb1f22cfd022535d1b8a31880f0b045acf64 4b0585cd17d8bc17a13958e6a61bf6f5288a1d1d

Commits:
- 4b0585cd Taste Lab: --help prints the usage, and the tally sorts like the page
- 900cbcbe Taste Lab: Back during the card change does not restart the tap guard
- d17c427e Taste Lab: a held Try it answer shows a ring
- a9b0b21c Taste Lab: one answer per card, bars in rate order, open cards keep their texts
- 47fbf59e Taste Lab: a stepped-back card shows its answer, the end screen steps back, labels must differ
- 9c22e459 Taste Lab: one self-contained page, no vendor store, built around fixing a skill issue
- cd727240 Taste Lab: review fixes
- ecf09b52 Taste Lab: duel cards from two eval runs, a phone page to vote, and the loop skill

Sources:
- pr PR #209
  https://github.com/matemolnar8/comprehende/pull/209

The title:

Taste Lab: fix a skill weakness with taps on a phone, not hand-written evals

The why:

In [PR #209](source:s1), the owner wants his taste in the skill and in review expectations, but never manages to hand-write evals or skill text.

The what (large):

Adds Taste Lab, scripts that build a phone page of blind duels between eval runs and read the answers back, plus a no-vendor-lock-in rule in `AGENTS.md`.

## Review concerns

### 01 Duel cards from two reviews (`cards`)

`duelCards` in `cards.ts` pairs the pieces two reviews of one case wrote, and the test pins each pairing rule.

Attention (product):
`duelCards` writes a card only when both reviews wrote the piece and their words differ. Trace: side x has a `why` and side y has none, so no `why` card appears, and the tally never sees that y left it out. Decide whether a missing piece should duel against an empty side.

[groups/cards.md](groups/cards.md)

### 02 Rounds and answer codes (`round`)

`round.ts` hashes the cards into a round id and reads the page's answer code back into picks and a tally.

Attention (contract):
The code `taste.<id>.<duels>.<ideas>` is the only link between `page.html` and `readCode`. The id is the first 8 hex characters of a SHA-1 over every card text, so `readCode` refuses a code whose id, length, or letters do not match `round.json`. Duel letters are `x y s n -`; idea letters are `y n -`.

Depends on:
- 01 Duel cards from two reviews (`cards`)

[groups/round.md](groups/round.md)

### 03 taste:page and taste:read commands (`run`)

`run.ts` backs the two new `package.json` scripts: `page` builds a round from eval runs, and `read` decodes a code.

Attention (risk):
When `TASTE_WEBHOOK_URL` is set in the environment or `.env`, `page` writes the URL into `index.html`, and the end screen posts the code to it. Anyone who opens a hosted copy can read the URL and post to it. The usage text and the skill say to keep such a page private; the code does not enforce it.

Depends on:
- 01 Duel cards from two reviews (`cards`)
- 02 Rounds and answer codes (`round`)

[groups/run.md](groups/run.md)

### 04 The phone page (`page`)

`page.html` shows each duel or idea card, keeps answers in `localStorage`, and ends on the answer code and a score.

Attention (tradeoff):
`answer` ignores a tap within 350 ms of a card showing, and the next card renders 170 ms after a pick. This stops the second tap of a double-tap from answering a card unseen, at the cost of dropping a fast deliberate tap.

Depends on:
- 02 Rounds and answer codes (`round`)

[groups/page.md](groups/page.md)

### 05 The taste-lab agent skill (`skill`)

The `taste-lab` skill tells an agent the loop from a pinned issue to an applied fix, and `AGENTS.md` points to it.

Depends on:
- 03 taste:page and taste:read commands (`run`)

[groups/skill.md](groups/skill.md)

### 06 No vendor lock-in rule (`vendor-rule`)

`AGENTS.md` adds a project rule: build on git, files, and plain HTML, with T3 Code as the one assumed harness.

Attention (product):
The rule bans lock-in to one agent or provider, but names T3 Code as the one harness agents may assume. `page.html` already reads T3 Code theme variables first and falls back to system colors. Decide whether T3 Code is an allowed default or an exception the rule should not name.

[groups/vendor-rule.md](groups/vendor-rule.md)