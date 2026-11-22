---
name: taste-lab
description: Tune review quality from Máté's Taste Lab votes. Use when asked for new duels, when he says he voted, or when two models or two skills are compared by his taste.
metadata:
  internal: true
---

# Taste Lab

Máté gives taste as taps on his phone, never as written evals. The Taste Lab page is a private claude.ai artifact with that title; find its URL with the Artifact tool's list. Its source is `scripts/taste/taste-lab.html`. Its store has three collections, read and written with `ArtifactData`:

- `duels`: one card per pair of review pieces. He picks a side blind.
- `rules`: one card per proposed rule. He answers yes, no, reverse, or depends.
- `answers`: his taps, keyed `duel__<card id>` and `rules__<rule id>`.

A **pick** is a duel answer. Picks are the ground truth. A yes on a rule card is weaker: he approved rules that his own picks contradict, so a rule stands only on the picks it explains.

## Load duels

1. Choose two `eval/runs/<stamp>` folders that hold reviews of the same cases. To compare models, both runs use one skill tree. To compare skills, both use one model. A new producer run costs money, so ask before you start one; saved runs are free.
2. Run `pnpm taste:cards -- <run dir> <run dir>`. It prints the cards as JSON and labels each side `<model> @ <skill tree>`.
3. Write about 20 cards to `duels` in one `batch`, each with an `order` number. Spread them over cases and kinds. Delete the cards he has answered.
4. Tell him how many cards wait, then end the turn.

## Read picks

Run this when he says he voted. Read `answers` and every card they point at.

1. Tally wins and losses per label, and per kind of piece. With fewer than 20 picks between two labels, report the tally as a hint, not a result.
2. Read `both-bad` as a failure of the skill on that piece, apart from the ranking.
3. For each rule card answered since the last read, list the picks that fit it and the picks against it.

## Propose rules

A rule earns a card when it explains two or more picks and has at most one pick against it. Write at most five cards per round, so a round stays under two minutes.

- `rule`: one plain sentence that fits any repository.
- `before` and `after`: the two real texts from a pick. Write `after` yourself only when no pick shows it.
- `evidence`: the count, such as "Fits 4 of your picks. Against: the cobra line note."

When picks contradict an approved rule, or he marks a pair both bad, write two cards with opposite guesses. His answers tell which reading is right.

## Apply rules

A rule is ready when he answered yes and the picks still fit it. `reverse` makes the opposite rule ready. `depends` and `no` go back to Propose rules as a narrower guess.

1. Put each ready rule where it acts: wording and grouping rules in `skills-next/comprehende/SKILL.md`, and what a review must or must not say for one case in that case's `expected.md`. Follow the project rules for skill edits in `AGENTS.md`.
2. Replace the skill sentence the rule overrides. A rule that only adds a line makes the skill longer and weaker.
3. Prove the edit with a duel: run the same cases with the old and the new skill tree, load those cards, and ask for picks. The edit stays when the new tree wins. Ask before this producer run.
4. Delete applied and rejected rule cards from `rules`.
