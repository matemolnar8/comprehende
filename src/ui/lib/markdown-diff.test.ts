import assert from "node:assert/strict";
import type { ElementContent } from "hast";
import { describe, it } from "vite-plus/test";
import type { DiffLine } from "../../schema/types.ts";
import {
  cellPins,
  markNodes,
  markdownFileRows,
  markdownRows,
  markdownUnits,
  patchChanges,
  patchSpans,
  rowGap,
  rowsInSpans,
  wordMarks,
  type MdCell,
  type MdRow,
} from "./markdown-diff.ts";

function hunk(oldStart: number, newStart: number, body: string[]) {
  let oldNumber = oldStart;
  let newNumber = newStart;
  const lines: DiffLine[] = body.map((raw) => {
    const text = raw.slice(1);
    if (raw.startsWith("+")) {
      return { kind: "add", oldNumber: null, newNumber: newNumber++, text };
    }
    if (raw.startsWith("-")) {
      return { kind: "del", oldNumber: oldNumber++, newNumber: null, text };
    }
    return { kind: "ctx", oldNumber: oldNumber++, newNumber: newNumber++, text };
  });
  return {
    oldStart,
    oldLines: oldNumber - oldStart,
    newStart,
    newLines: newNumber - newStart,
    lines,
  };
}

/** Marked words in double brackets, so a test reads like the page. */
function text(nodes: readonly ElementContent[]): string {
  return nodes
    .map((node) =>
      node.type === "text"
        ? node.value
        : node.type !== "element"
          ? ""
          : node.tagName === "mark"
            ? `[[${text(node.children)}]]`
            : text(node.children),
    )
    .join("");
}

function shape(rows: readonly MdRow[]): string[] {
  const cell = (sign: string) => (item: MdCell) =>
    `${sign}${item.moved ? "~" : ""} ${text(item.source ?? item.nodes).trim()}`;
  return rows.flatMap((row) =>
    row.kind === "context"
      ? [cell(" ")(row.new)]
      : row.kind === "code"
        ? [`code ${row.old.unit.code?.value} => ${row.new.unit.code?.value}`]
        : [...row.old.map(cell("-")), ...row.new.map(cell("+"))],
  );
}

function tags(nodes: readonly ElementContent[]): string[] {
  return nodes.flatMap((node) =>
    node.type === "element" ? [node.tagName, ...tags(node.children)] : [],
  );
}

describe("markdownUnits", () => {
  it("splits a list into the blocks of its items", () => {
    const units = markdownUnits(
      ["# Title", "", "1. one", "2. two", "", "   ```sh", "   run", "   ```", "   - deep"].join(
        "\n",
      ),
    );
    assert.deepEqual(
      units.map((unit) => [unit.start, unit.end, unit.containers.map((c) => c.kind).join(">")]),
      [
        [1, 1, ""],
        [3, 3, "item"],
        [4, 4, "item"],
        [6, 8, "item"],
        [9, 9, "item>item"],
      ],
    );
    const [, one, two, code] = units.map((unit) => unit.containers[0]);
    assert.deepEqual(one, { kind: "item", ordered: true, number: 1, checked: null, first: true });
    assert.equal(two?.kind === "item" && two.number, 2);
    // The code block is in item 2 and does not repeat its number.
    assert.equal(code?.kind === "item" && code.first, false);
  });

  it("keeps front matter as one block and the line numbers after it", () => {
    const units = markdownUnits(["---", "name: a", "---", "", "Text"].join("\n"));
    assert.deepEqual(
      units.map((unit) => [unit.start, unit.end, text(unit.nodes)]),
      [
        [1, 3, "name: a\n"],
        [5, 5, "Text"],
      ],
    );
  });

  it("renders HTML, in a line of text and as a block", () => {
    const units = markdownUnits(
      ["Press <kbd>x</kbd>.", "", '<p align="center"><img src="a.png" alt="A"></p>'].join("\n"),
    );
    assert.deepEqual(
      units.map((unit) => [text(unit.nodes), tags(unit.nodes).join(" ")]),
      [
        ["Press x.", "p kbd"],
        ["", "p img"],
      ],
    );
  });

  it("drops the parts of HTML that run code or leave the page", () => {
    const [unit] = markdownUnits(
      [
        '<div onclick="steal()" style="position:fixed">',
        "<script>steal()</script>",
        '<a href="javascript:steal()">go</a>',
        '<img src="data:image/svg+xml,x" onerror="steal()">',
        '<iframe src="https://example.com"></iframe>',
        "</div>",
      ].join("\n"),
    );
    assert.ok(unit !== undefined);
    const elements = (nodes: readonly ElementContent[]): ElementContent[] =>
      nodes.flatMap((node) => (node.type === "element" ? [node, ...elements(node.children)] : []));
    assert.deepEqual(
      elements(unit.nodes).map((node) => (node.type === "element" ? node : undefined)?.tagName),
      ["div", "a", "img"],
    );
    assert.deepEqual(
      elements(unit.nodes).map((node) => (node.type === "element" ? node.properties : {})),
      [{}, {}, {}],
    );
  });

  it("holds the source of a block that renders as nothing, and flags the block", () => {
    const units = markdownUnits(
      [
        "[ref]: https://example.com",
        "",
        "<!-- a note -->",
        "",
        "<details>",
        "",
        "Text.",
        "",
        "</details>",
      ].join("\n"),
    );
    assert.deepEqual(
      units.map((unit) => [text(unit.nodes), unit.silent === true]),
      [
        ["[ref]: https://example.com", true],
        ["<!-- a note -->", true],
        ["<details>", true],
        ["Text.", false],
        ["</details>", true],
      ],
    );
  });

  it("keeps the text and the language of a code block", () => {
    const units = markdownUnits(["```ts", "const a = 1;", "```", "", "    plain"].join("\n"));
    assert.deepEqual(
      units.map((unit) => unit.code),
      [
        { lang: "ts", value: "const a = 1;" },
        { lang: null, value: "plain" },
      ],
    );
  });
});

describe("markdownFileRows", () => {
  it("reads every block of a file as context", () => {
    assert.deepEqual(shape(markdownFileRows("# Title\n\nText.\n\n- item")), [
      "  Title",
      "  Text.",
      "  item",
    ]);
  });
});

describe("markdownRows", () => {
  it("pairs a changed block with its new text and marks the words that differ", () => {
    const rows = markdownRows(
      ["# Title", "", "Run the unit tests first.", "", "Then deploy."].join("\n"),
      ["# Title", "", "Run the unit and e2e tests first.", "", "Then deploy."].join("\n"),
      [
        hunk(1, 1, [
          " # Title",
          " ",
          "-Run the unit tests first.",
          "+Run the unit and e2e tests first.",
          " ",
          " Then deploy.",
        ]),
      ],
    );
    assert.deepEqual(shape(rows), [
      "  Title",
      "- Run the unit tests first.",
      "+ Run the unit [[and e2e]] tests first.",
      "  Then deploy.",
    ]);
  });

  it("shows the whole block when one of its lines changed", () => {
    const rows = markdownRows(["one", "two", "three"].join("\n"), ["one", "three"].join("\n"), [
      hunk(1, 1, [" one", "-two", " three"]),
    ]);
    assert.deepEqual(shape(rows), ["- one\n[[two]]\nthree", "+ one\nthree"]);
  });

  it("puts a removed block where it was, before the block that follows it", () => {
    const rows = markdownRows(
      ["Keep A.", "", "Gone.", "", "Keep B."].join("\n"),
      ["Keep A.", "", "Keep B."].join("\n"),
      [hunk(1, 1, [" Keep A.", " ", "-Gone.", "-", " Keep B."])],
    );
    assert.deepEqual(shape(rows), ["  Keep A.", "- Gone.", "  Keep B."]);
  });

  it("makes one row of two blocks that became one", () => {
    const rows = markdownRows(
      ["First part.", "", "Second part."].join("\n"),
      ["First part.", "Second part."].join("\n"),
      [hunk(1, 1, [" First part.", "-", " Second part."])],
    );
    assert.deepEqual(shape(rows), [
      "- First part.",
      "- Second part.",
      "+ First part.\nSecond part.",
    ]);
  });

  it("leaves a rewritten block without word marks", () => {
    const rows = markdownRows("Alpha beta gamma delta.", "Nothing here is the same now.", [
      hunk(1, 1, ["-Alpha beta gamma delta.", "+Nothing here is the same now."]),
    ]);
    assert.deepEqual(shape(rows), ["- Alpha beta gamma delta.", "+ Nothing here is the same now."]);
  });

  it("reads a code block with a changed line as a line diff of the block", () => {
    const rows = markdownRows(
      ["```sh", "pnpm build", "pnpm test", "```"].join("\n"),
      ["```sh", "pnpm build", "pnpm check", "```"].join("\n"),
      [hunk(1, 1, [" ```sh", " pnpm build", "-pnpm test", "+pnpm check", " ```"])],
    );
    assert.deepEqual(shape(rows), ["code pnpm build\npnpm test => pnpm build\npnpm check"]);
  });

  it("shows the source of a code block when only its fence changed", () => {
    const rows = markdownRows(
      ["```", "run", "```"].join("\n"),
      ["```sh", "run", "```"].join("\n"),
      [hunk(1, 1, ["-```", "+```sh", " run", " ```"])],
    );
    assert.deepEqual(shape(rows), ["- ```\nrun\n```", "+ ```[[sh]]\nrun\n```"]);
  });

  it("keeps a code block out of the word marks of the text around it", () => {
    const rows = markdownRows(
      ["Run it today.", "```", "a b", "```"].join("\n"),
      ["Run it now.", "```", "a today", "```"].join("\n"),
      [
        hunk(1, 1, [
          "-Run it today.",
          "-```",
          "-a b",
          "-```",
          "+Run it now.",
          "+```",
          "+a today",
          "+```",
        ]),
      ],
    );
    assert.deepEqual(shape(rows), [
      "- Run it [[today]].",
      "- a b",
      "+ Run it [[now]].",
      "+ a today",
    ]);
  });

  it("shows the source of a block when only its markup changed", () => {
    const rows = markdownRows("See the [guide](docs/a.md).", "See the [guide](docs/b.md).", [
      hunk(1, 1, ["-See the [guide](docs/a.md).", "+See the [guide](docs/b.md)."]),
    ]);
    assert.deepEqual(shape(rows), [
      "- See the [guide](docs/[[a]].md).",
      "+ See the [guide](docs/[[b]].md).",
    ]);
  });

  it("shows the source of an image whose path changed", () => {
    const rows = markdownRows("![chart](a.png)", "![chart](b.png)", [
      hunk(1, 1, ["-![chart](a.png)", "+![chart](b.png)"]),
    ]);
    assert.deepEqual(shape(rows), ["- ![chart]([[a]].png)", "+ ![chart]([[b]].png)"]);
  });

  it("flags a block git found moved, and keeps it out of the word diff", () => {
    const moved = { path: "a.md", line: 1 };
    const rows = markdownRows(
      ["Moved text.", "", "Stay."].join("\n"),
      ["Stay.", "", "Moved text."].join("\n"),
      [
        {
          ...hunk(1, 1, ["-Moved text.", "-", " Stay.", "+", "+Moved text."]),
          lines: [
            { kind: "del", oldNumber: 1, newNumber: null, text: "Moved text.", moved },
            { kind: "del", oldNumber: 2, newNumber: null, text: "" },
            { kind: "ctx", oldNumber: 3, newNumber: 1, text: "Stay." },
            { kind: "add", oldNumber: null, newNumber: 2, text: "" },
            { kind: "add", oldNumber: null, newNumber: 3, text: "Moved text.", moved },
          ],
        },
      ],
    );
    assert.deepEqual(shape(rows), ["-~ Moved text.", "  Stay.", "+~ Moved text."]);
  });

  it("reads only one side of an added file", () => {
    const rows = markdownRows(undefined, "# New\n\nText.", [hunk(0, 1, ["+# New", "+", "+Text."])]);
    assert.deepEqual(shape(rows), ["+ New", "+ Text."]);
  });

  it("keeps a second hunk in step when lines were added above it", () => {
    const oldLines = ["A", "", "B", "", "x", "", "x", "", "x", "", "C", "", "D"];
    const newLines = ["A", "", "B2", "", "B3", "", "x", "", "x", "", "x", "", "C", "", "D2"];
    const rows = markdownRows(oldLines.join("\n"), newLines.join("\n"), [
      hunk(1, 1, [" A", " ", "-B", "+B2", "+", "+B3", " "]),
      hunk(11, 13, [" C", " ", "-D", "+D2"]),
    ]);
    assert.deepEqual(shape(rows), ["  A", "- B", "+ B2", "+ B3", "  C", "- D", "+ D2"]);
  });

  it("keeps the rendered block beside the source when only markup changed", () => {
    const rows = markdownRows('<img src="a.png" alt="A">', '<img src="a.png" alt="B">', [
      hunk(1, 1, ['-<img src="a.png" alt="A">', '+<img src="a.png" alt="B">']),
    ]);
    const [row] = rows;
    assert.ok(row?.kind === "change");
    assert.deepEqual(tags(row.new[0]?.nodes ?? []), ["img"]);
    assert.equal(text(row.new[0]?.source ?? []), '<img src="a.png" alt="[[B]]">');
  });

  it("shows a changed comment as its source, with no second copy", () => {
    const rows = markdownRows("<!-- old note -->", "<!-- new note -->", [
      hunk(1, 1, ["-<!-- old note -->", "+<!-- new note -->"]),
    ]);
    const [row] = rows;
    assert.ok(row?.kind === "change");
    assert.equal(text(row.new[0]?.nodes ?? []), "<!-- [[new]] note -->");
    assert.equal(row.new[0]?.source, undefined);
  });
});

describe("wordMarks", () => {
  it("joins changes that one kept word separates", () => {
    const marks = wordMarks(["a b c d e f g h"], ["a X c Y e f g h"]);
    assert.deepEqual(marks.new, [[{ from: 2, to: 7 }]]);
  });

  it("keeps a change apart from the next one when more text is kept between them", () => {
    const marks = wordMarks(
      ["Run pnpm eval before you push."],
      ["Run pnpm eval with the smoke tag before you open a PR."],
    );
    assert.deepEqual(marks.new, [
      [
        { from: 14, to: 32 },
        { from: 44, to: 53 },
      ],
    ]);
  });

  it("does not count a match of punctuation as kept text", () => {
    const marks = wordMarks(["Alpha, beta (gamma)."], ["One, two (three)."]);
    assert.deepEqual(marks, { old: [[]], new: [[]] });
  });

  it("marks a long text with nothing in common without a time limit", () => {
    const words = (prefix: string) =>
      Array.from({ length: 4000 }, (_, i) => `${prefix}${i % 900}`).join(" ");
    assert.deepEqual(wordMarks([words("a")], [words("b")]), { old: [[]], new: [[]] });
  });

  it("compares the blocks of a row as one text", () => {
    const marks = wordMarks(["gone one two", "stay here now ok"], ["stay here then ok"]);
    assert.deepEqual(marks.old, [[], [{ from: 10, to: 13 }]]);
    assert.deepEqual(marks.new, [[{ from: 10, to: 14 }]]);
  });
});

describe("markNodes", () => {
  it("does not mark the white space between elements", () => {
    const cell = (value: string): ElementContent => ({
      type: "element",
      tagName: "td",
      properties: {},
      children: [{ type: "text", value }],
    });
    const marked = markNodes(
      [cell("ab"), { type: "text", value: "\n" }, cell("cd")],
      [{ from: 1, to: 4 }],
    );
    assert.equal(text(marked), "a[[b]]\n[[c]]d");
  });
});

describe("a patch that shows part of the file", () => {
  const source = ["One.", "", "Two.", "", "Three.", "", "Four."].join("\n");
  const rows = markdownRows(source, source.replace("Four.", "Four!"), [
    hunk(1, 1, [" One.", " ", " Two.", " ", " Three.", " ", "-Four.", "+Four!"]),
  ]);

  it("shows the rows on the lines of its hunks", () => {
    const spans = patchSpans(
      "--- a/a.md\n+++ b/a.md\n@@ -5,3 +5,3 @@\n Three.\n \n-Four.\n+Four!\n",
    );
    assert.deepEqual(shape(rowsInSpans(rows, spans)), ["  Three.", "- Four[[.]]", "+ Four[[!]]"]);
  });

  it("knows a patch of context lines from a patch with a change", () => {
    assert.equal(patchChanges("--- a/a.md\n+++ b/a.md\n@@ -1,2 +1,2 @@\n One.\n \n"), false);
    assert.equal(patchChanges("--- a/a.md\n+++ b/a.md\n@@ -7 +7 @@\n-Four.\n+Four!\n"), true);
  });

  it("names the lines between rows that are not next to each other", () => {
    const [one, , three] = rows;
    assert.ok(one !== undefined && three !== undefined);
    assert.deepEqual(rowGap(one, three), { from: 2, to: 4 });
    assert.equal(rowGap(one, rows[1] ?? one), undefined);
  });

  it("hangs a pin on the block of its line, and only inside the patch", () => {
    const spans = patchSpans("@@ -5,3 +5,3 @@\n");
    const shown = rowsInSpans(rows, spans);
    const note = (line: number) => ({
      path: "a.md",
      side: "new" as const,
      line,
      body: "",
      letter: "A",
    });
    const pins = cellPins(shown, spans, { notes: [note(7), note(6), note(1)] });
    const three = shown[0]?.kind === "context" ? shown[0].new : undefined;
    const four = shown[1]?.kind === "change" ? shown[1].new[0] : undefined;
    assert.ok(three !== undefined && four !== undefined);
    // Line 6 is blank: its pin hangs on the block above. Line 1 is outside the patch.
    assert.deepEqual(
      pins.get(three)?.notes.map((item) => item.line),
      [6],
    );
    assert.deepEqual(
      pins.get(four)?.notes.map((item) => item.line),
      [7],
    );
  });
});
