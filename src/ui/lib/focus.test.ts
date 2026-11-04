import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import type { FocusRange } from "../../schema/types.ts";
import type { LiveHunk } from "../api.ts";
import { fileFocus, focusBlocks, letterNotes, toggleHunk, type FocusBlock } from "./focus.ts";
import { gutterDigits, hunkGaps } from "./hunk-gaps.ts";

function hunk(oldStart: number, newStart: number, body: string[]): LiveHunk {
  let oldNumber = oldStart;
  let newNumber = newStart;
  const lines = body.map((raw) => {
    const text = raw.slice(1);
    if (raw.startsWith("+")) {
      return { kind: "add" as const, oldNumber: null, newNumber: newNumber++, text };
    }
    if (raw.startsWith("-")) {
      return { kind: "del" as const, oldNumber: oldNumber++, newNumber: null, text };
    }
    return { kind: "ctx" as const, oldNumber: oldNumber++, newNumber: newNumber++, text };
  });
  return {
    path: "a.ts",
    oldStart,
    oldLines: oldNumber - oldStart,
    newStart,
    newLines: newNumber - newStart,
    header: `@@ -${oldStart},${oldNumber - oldStart} +${newStart},${newNumber - newStart} @@`,
    language: "typescript",
    lines,
  };
}

function patchOf(hunks: { header: string; body: string[] }[]): string {
  return `diff --git a/a.ts b/a.ts\n--- a/a.ts\n+++ b/a.ts\n${hunks.map((h) => [h.header, ...h.body].join("\n")).join("\n")}\n`;
}

const firstBody = [" a", " b", "-old", "+new1", "+new2", " c", "-gone", " d", "+tail"];
const secondBody = [" x", "+y"];
const first = hunk(10, 10, firstBody);
const second = hunk(40, 41, secondBody);
const patch = patchOf([
  { header: first.header, body: firstBody },
  { header: second.header, body: secondBody },
]);

function range(start: number, end: number, side: "old" | "new" = "new"): FocusRange {
  return { path: "a.ts", side, start, end, caption: "c" };
}

const FILE_HEADER = "diff --git a/a.ts b/a.ts\n--- a/a.ts\n+++ b/a.ts\n";

/** Each block as one readable line: a bar, a hidden-lines row, or the diff body under the header. */
function view(blocks: readonly FocusBlock[] | undefined): string[] | undefined {
  return blocks?.map((block) =>
    block.kind === "bar"
      ? `bar ${block.hunk}${block.whole ? " whole" : ""}`
      : block.kind === "hidden"
        ? `${block.key} ${block.count}${block.notes.map((note) => ` ${note.letter}`).join("")}`
        : block.patch.slice(FILE_HEADER.length).trimEnd().split("\n").join(" | "),
  );
}

describe("focus", () => {
  it("cuts a hunk to its range plus the deletions an added line replaces, with a row at each cut edge", () => {
    const focus = fileFocus([first, second], [range(12, 13)]);
    assert.deepEqual(
      focus.map((item) => [item.hunk, item.shown]),
      [[0, [2, 3, 4]]],
    );
    assert.deepEqual(view(focusBlocks(patch, [first, second], focus, new Set(), [])), [
      "bar 0",
      "hidden-0-0 2",
      "@@ -12,1 +12,2 @@ | -old | +new1 | +new2",
      "hidden-0-5 4",
      `${second.header} | ${secondBody.join(" | ")}`,
    ]);
  });

  it("splits two ranges with a row between, and ignores a range outside every hunk", () => {
    const focus = fileFocus([first, second], [range(10, 10), range(14, 15), range(90, 91)]);
    assert.deepEqual(focus[0]?.shown, [0, 5, 6, 7]);
    assert.equal(focus.length, 1);
    assert.deepEqual(view(focusBlocks(patch, [first, second], focus, new Set(), [])), [
      "bar 0",
      "@@ -10,1 +10,1 @@ |  a",
      "hidden-0-1 4",
      "@@ -13,3 +14,2 @@ |  c | -gone |  d",
      "hidden-0-8 1",
      `${second.header} | ${secondBody.join(" | ")}`,
    ]);
  });

  it("shows the whole hunk under its bar, and renders whole when no hunk has a range", () => {
    const focus = fileFocus([first, second], [range(12, 13)]);
    assert.deepEqual(view(focusBlocks(patch, [first, second], focus, new Set(["bar-0"]), [])), [
      "bar 0 whole",
      `${first.header} | ${firstBody.join(" | ")}`,
      `${second.header} | ${secondBody.join(" | ")}`,
    ]);
    assert.equal(focusBlocks(patch, [first, second], [], new Set(), []), undefined);
  });

  it("reads an old-side range on old line numbers and brings the paired additions", () => {
    const focus = fileFocus([first], [range(12, 12, "old")]);
    assert.deepEqual(focus[0]?.shown, [2, 3, 4]);
  });

  it("shows the whole change block when a range starts inside it", () => {
    const block = hunk(5, 5, [" a", "-x", "-y", "+X", "+Y", "+Z", " b"]);
    assert.deepEqual(fileFocus([block], [range(7, 8)])[0]?.shown, [1, 2, 3, 4, 5]);
    assert.deepEqual(fileFocus([block], [range(7, 7, "old")])[0]?.shown, [2, 3, 4, 5]);
  });

  it("writes git's start line on an empty side, for a new file and for an insertion", () => {
    const added = hunk(0, 1, ["+one", "+two", "+three", "+four"]);
    const newFile = patchOf([{ header: added.header, body: ["+one", "+two", "+three", "+four"] }]);
    assert.deepEqual(
      view(focusBlocks(newFile, [added], fileFocus([added], [range(3, 4)]), new Set(), [])),
      ["bar 0", "hidden-0-0 2", "@@ -0,0 +3,2 @@ | +three | +four"],
    );
    const inserted = hunk(7, 7, [" a", "+b", "+c"]);
    const insertedPatch = patchOf([{ header: inserted.header, body: [" a", "+b", "+c"] }]);
    assert.deepEqual(
      view(
        focusBlocks(insertedPatch, [inserted], fileFocus([inserted], [range(9, 9)]), new Set(), []),
      ),
      ["bar 0", "hidden-0-0 2", "@@ -7,0 +9,1 @@ | +c"],
    );
  });

  it("opens only the lines of the hidden row the reader opened", () => {
    const focus = fileFocus([first, second], [range(12, 13)]);
    assert.deepEqual(
      view(focusBlocks(patch, [first, second], focus, new Set(["hidden-0-0"]), [])),
      [
        "bar 0",
        "@@ -10,3 +10,4 @@ |  a |  b | -old | +new1 | +new2",
        "hidden-0-5 4",
        `${second.header} | ${secondBody.join(" | ")}`,
      ],
    );
  });

  it("calls a hunk whole once every hidden row is open, and closes the rows with the bar", () => {
    const focus = fileFocus([first, second], [range(12, 13)]);
    const open = new Set(["hidden-0-0", "hidden-0-5"]);
    const blocks = focusBlocks(patch, [first, second], focus, open, []);
    assert.deepEqual(view(blocks)?.slice(0, 2), [
      "bar 0 whole",
      `${first.header} | ${firstBody.join(" | ")}`,
    ]);
    const bar = blocks?.find((block) => block.kind === "bar");
    assert.ok(bar?.kind === "bar");
    assert.deepEqual([...toggleHunk(new Set([...open, "hidden-1-0"]), bar)], ["hidden-1-0"]);
    assert.deepEqual([...toggleHunk(new Set(), { ...bar, whole: false })], ["bar-0"]);
  });

  it("names on each hidden row the notes it hides, and leaves a note on a shown line to its pin", () => {
    const focus = fileFocus([first], [range(12, 13)]);
    const notes = letterNotes([
      { path: "a.ts", side: "new", line: 13, body: "shown" },
      { path: "a.ts", side: "new", line: 16, body: "hidden below" },
      { path: "a.ts", side: "old", line: 10, body: "hidden above" },
    ]);
    const firstPatch = patchOf([{ header: first.header, body: firstBody }]);
    assert.deepEqual(view(focusBlocks(firstPatch, [first], focus, new Set(), notes)), [
      "bar 0",
      "hidden-0-0 2 C",
      "@@ -12,1 +12,2 @@ | -old | +new1 | +new2",
      "hidden-0-5 4 B",
    ]);
  });
});

describe("hunkGaps", () => {
  it("names the lines after a cut hunk on the next hunk, apart from its hidden-lines row", () => {
    const focus = fileFocus([first, second], [range(12, 13)]);
    const blocks = focusBlocks(patch, [first, second], focus, new Set(), []) ?? [];
    assert.deepEqual([...hunkGaps(blocks, [first, second])], [["plain-2", { from: 17, to: 40 }]]);
  });

  it("names the lines between a whole hunk and the next hunk, on the block that starts it", () => {
    const focus = fileFocus([first, second], [range(12, 13)]);
    const blocks = focusBlocks(patch, [first, second], focus, new Set(["bar-0"]), []) ?? [];
    assert.deepEqual([...hunkGaps(blocks, [first, second])], [["plain-2", { from: 17, to: 40 }]]);
  });

  it("puts the row before the focus bar when the later hunk has a range", () => {
    const focus = fileFocus([first, second], [range(42, 42)]);
    const blocks = focusBlocks(patch, [first, second], focus, new Set(), []) ?? [];
    assert.deepEqual([...hunkGaps(blocks, [first, second])], [["bar-1", { from: 17, to: 40 }]]);
  });

  it("adds no row inside one hunk", () => {
    const focus = fileFocus([first], [range(12, 13)]);
    const single = patchOf([{ header: first.header, body: firstBody }]);
    const blocks = focusBlocks(single, [first], focus, new Set(), []) ?? [];
    assert.equal(hunkGaps(blocks, [first]).size, 0);
  });
});

describe("gutterDigits", () => {
  it("counts the digits of the largest line number on either side", () => {
    assert.equal(gutterDigits([hunk(1, 1, [" a", "-b", "+c"])]), 1);
    assert.equal(
      gutterDigits([hunk(1, 1, [" a"]), hunk(97, 97, [" a", " b", " c", " d", " e"])]),
      3,
    );
    assert.equal(gutterDigits([hunk(120, 8, ["-a"])]), 3);
  });
});
