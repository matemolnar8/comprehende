---
name: taste-lab
description: Fix a weakness of the comprehende skill by Máté's taste. Use when he names something he dislikes in reviews, sends a `taste.` code, or asks for duels between skills or models.
metadata:
  internal: true
---

# Taste Lab

Máté judges review quality with taps on his phone, never with written evals. A **round** is one HTML page of cards. `pnpm taste:page` builds it, and `pnpm taste:read` turns the code he sends back into picks. `pnpm taste:page -- --help` lists the flags.

- A **duel** shows the same piece of a review from two eval runs, with the sides hidden. His **pick** is the ground truth.
- An **idea** card shows one skill change with a real before and after. He says yes to most ideas, so "Try it" earns the idea a test run and proves nothing more.

## Fix an issue

1. **Pin the issue.** Find it in reviews that saved runs wrote: `eval/runs/*/<case>/review.json` in this checkout and its sibling worktrees. Name the kinds of piece it shows in (the `--kind` values) and two or more cases. Done when you hold three real texts that show the issue.
2. **Write ideas.** Two to four different one-sentence changes to the skill that could fix it. For each, copy `skills-next/comprehende` to a folder outside the worktree, named for the idea, and make that one edit. The folder name is the idea's label in duels.
3. **Ask with idea cards.** Write `{ idea, before, after }` per idea, with `before` from step 1, and build a round with `--ideas`. Show it and end the turn. A "Try it" approves the paid run of that idea in step 4.
4. **Run.** Run the cases from step 1 once with the current skill, `pnpm eval -- --case <id> --no-graders`, and once per approved idea with `--skill <idea folder>` added. Use one producer model for all. Read `docs/eval.md` first.
5. **Duel.** `pnpm taste:page -- --run current=<run dir> --run <idea>=<run dir> --kind <kind>`, with one `--run` per idea. Show it and end the turn.
6. **Read picks.** `pnpm taste:read -- <code>` prints the wins per label and each pick with both texts. An idea wins when it beats `current` and no other idea beats it. Under eight picks between two labels is a hint: add cases and duel again. A piece he marks both bad is one no idea fixed: take those texts back to step 2.
7. **Apply the winner** to `skills-next/comprehende/SKILL.md` under the project rules in `AGENTS.md`. Replace the sentence it overrides; an added line makes the skill longer and weaker.

## Compare models

Steps 4 to 6 with one skill and one `--producer-model` per run. Label each `--run` with its model.

## Show a round

`taste:page` prints the path of one self-contained HTML file. Show it the way your harness can: inline in the thread when the harness renders HTML, else hosted with the `pages` skill, else as a file path. He answers when he has a minute, so end the turn.

The page ends on a code that starts with `taste.`. He pastes it in the thread. When `TASTE_WEBHOOK_URL` is set, the page also posts the code to that URL, which can start an agent run with no paste. Such a page holds the URL, so show it inline and never host it.
