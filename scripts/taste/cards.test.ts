import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import type { ReviewDocument, ReviewGroup } from "../../src/schema/types.ts";
import { duelCards, type Side } from "./cards.ts";

const hunk = (path: string) => ({ path, oldStart: 1, oldLines: 1, newStart: 1, newLines: 2 });

type GroupInput = Omit<ReviewGroup, "title" | "summary" | "hunkRefs" | "suggestedOrder"> &
  Partial<Pick<ReviewGroup, "title" | "summary">>;

function group(over: GroupInput, paths: string[]): ReviewGroup {
  return {
    suggestedOrder: 0,
    ...over,
    title: over.title ?? over.id,
    summary: over.summary ?? "It does a thing.",
    hunkRefs: paths.map(hunk),
  };
}

function side(label: string, over: Partial<ReviewDocument>): Side {
  return {
    label,
    document: {
      version: 1,
      source: { baseRef: "base", headRef: "HEAD" },
      size: "small",
      title: "A change",
      summary: "The code does a thing.",
      groups: [group({ id: "all" }, ["a.ts", "a.test.ts"])],
      ...over,
    },
  };
}

const kinds = (x: Side, y: Side) => duelCards("case-1", x, y).map((card) => card.kind);

describe("duelCards", () => {
  it("writes no card when both reviews say the same", () => {
    assert.deepEqual(kinds(side("x", {}), side("y", {})), []);
  });

  it("pairs the pieces both reviews wrote, and skips a piece only one wrote", () => {
    const x = side("x", { summary: "Adds a thing.", why: "The ticket asks for it." });
    const y = side("y", { summary: "New thing." });
    const cards = duelCards("case-1", x, y);
    assert.deepEqual(
      cards.map((card) => card.kind),
      ["summary"],
    );
    assert.deepEqual(cards[0]?.x, { label: "x", text: "Adds a thing." });
    assert.deepEqual(cards[0]?.y, { label: "y", text: "New thing." });
  });

  it("asks about the grouping when the files are split in another way", () => {
    const split = [group({ id: "code" }, ["a.ts"]), group({ id: "tests" }, ["a.test.ts"])];
    const cards = duelCards("case-1", side("x", { groups: split }), side("y", {}));
    const grouping = cards.find((card) => card.kind === "grouping");
    assert.equal(grouping?.x.text, "2 groups\n• code: a.ts\n• tests: a.test.ts");
    assert.equal(grouping?.y.text, "1 group\n• all: a.test.ts, a.ts");
  });

  it("pairs groups that share most files, with their attention", () => {
    const x = side("x", { groups: [group({ id: "left", summary: "Left." }, ["a.ts", "b.ts"])] });
    const y = side("y", {
      groups: [
        group({ id: "other" }, ["z.ts"]),
        group(
          { id: "right", summary: "Right.", attention: { kind: "risk", note: "It can fail." } },
          ["a.ts", "b.ts", "c.ts"],
        ),
      ],
    });
    const card = duelCards("case-1", x, y).find((entry) => entry.kind === "group");
    assert.deepEqual(card?.x, { label: "x", title: "left", text: "Left." });
    assert.deepEqual(card?.y, {
      label: "y",
      title: "right",
      text: "Right.\nAttention: It can fail.",
    });
  });

  it("pairs line notes on the same line and file notes on the same path", () => {
    const notes = (body: string, line: number, fileNote: string): Partial<ReviewDocument> => ({
      groups: [
        group(
          {
            id: "all",
            notes: [{ path: "a.ts", side: "new", line, body }],
            fileNotes: { "a.ts": fileNote },
          },
          ["a.ts", "a.test.ts"],
        ),
      ],
    });
    const x = side("x", notes("Left note.", 10, "Left file."));
    assert.deepEqual(kinds(x, side("y", notes("Right note.", 11, "Right file."))), [
      "fileNote",
      "lineNote",
    ]);
    assert.deepEqual(kinds(x, side("y", notes("Right note.", 20, "Left file."))), []);
  });

  it("keeps at most three cards of one kind for a case", () => {
    const paths = ["a.ts", "b.ts", "c.ts", "d.ts", "e.ts"];
    const withNotes = (word: string): Partial<ReviewDocument> => ({
      groups: [
        group(
          {
            id: "all",
            fileNotes: Object.fromEntries(paths.map((path) => [path, `${word} ${path}`])),
          },
          paths,
        ),
      ],
    });
    assert.deepEqual(kinds(side("x", withNotes("Left")), side("y", withNotes("Right"))), [
      "fileNote",
      "fileNote",
      "fileNote",
    ]);
  });
});
