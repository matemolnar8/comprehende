import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import { limitDuels, makeRound, readCode, tally, type Duel } from "./round.ts";

function duel(id: string, x = "old", y = "new"): Duel {
  return {
    id: `case-1.summary.${id}`,
    case: "case-1",
    kind: "summary",
    question: "Which one-line summary is better?",
    context: "case-1 · A change",
    x: { label: x, text: "Left." },
    y: { label: y, text: "Right." },
  };
}

const idea = { idea: "Shorter notes.", before: "A long note.", after: "A note." };

describe("taste round", () => {
  it("reads the page's code back into picks, in card order", () => {
    const round = makeRound([duel("aa"), duel("bb"), duel("cc"), duel("dd")], [idea, idea]);
    const picks = readCode(round, `taste.${round.id}.xyns.y-`);
    assert.deepEqual(
      picks.duels.map((pick) => pick.answer),
      ["x", "y", "both-bad", "same"],
    );
    assert.deepEqual(
      picks.ideas.map((pick) => pick.answer),
      ["try", "open"],
    );
  });

  it("refuses a code from another round, of another length, or with an unknown letter", () => {
    const round = makeRound([duel("aa"), duel("bb")], []);
    assert.throws(() => readCode(round, "taste.000000.xy."), /round 000000/);
    assert.throws(() => readCode(round, `taste.${round.id}.x.`), /holds 1 duels/);
    assert.throws(() => readCode(round, `taste.${round.id}.xq.`), /unknown answer letter "q"/);
    assert.throws(() => readCode(round, "hello"), /not a taste code/);
  });

  it("counts a pick for one side and against the other, and nothing for same or both bad", () => {
    const round = makeRound(
      [duel("aa"), duel("bb"), duel("cc"), duel("dd"), duel("ee", "old", "other")],
      [],
    );
    assert.deepEqual(tally(readCode(round, `taste.${round.id}.yyxsn.`)), [
      { label: "new", wins: 2, losses: 1 },
      { label: "old", wins: 1, losses: 2 },
      { label: "other", wins: 0, losses: 0 },
    ]);
  });

  it("limits the duels and keeps their order", () => {
    const duels = [duel("cc"), duel("aa"), duel("dd"), duel("bb")];
    assert.deepEqual(
      limitDuels(duels, 2).map((kept) => kept.id),
      ["case-1.summary.aa", "case-1.summary.bb"],
    );
  });
});
