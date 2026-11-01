import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import type { FocusRange } from "../../schema/types.ts";
import type { LiveHunk } from "../api.ts";
import { fileFocus, focusPatch, hiddenNotes, letterNotes } from "./focus.ts";

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

describe("focus", () => {
  it("cuts a hunk to its range plus the deletions an added line replaces", () => {
    const focus = fileFocus([first, second], [range(12, 13)]);
    assert.deepEqual(
      focus.map((item) => [item.hunk, item.shown, item.total]),
      [[0, [2, 3, 4], 9]],
    );
    assert.equal(
      focusPatch(patch, [first, second], focus),
      patchOf([
        { header: "@@ -12,1 +12,2 @@", body: ["-old", "+new1", "+new2"] },
        { header: second.header, body: secondBody },
      ]),
    );
  });

  it("keeps deletions inside the range, splits two ranges apart, and ignores a range outside every hunk", () => {
    const focus = fileFocus([first, second], [range(10, 10), range(14, 15), range(90, 91)]);
    assert.deepEqual(focus[0]?.shown, [0, 5, 6, 7]);
    assert.equal(focus.length, 1);
    assert.equal(
      focusPatch(patch, [first, second], focus),
      patchOf([
        { header: "@@ -10,1 +10,1 @@", body: [" a"] },
        { header: "@@ -13,3 +14,2 @@", body: [" c", "-gone", " d"] },
        { header: second.header, body: secondBody },
      ]),
    );
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
    const addedBody = ["+one", "+two", "+three", "+four"];
    const newFile = patchOf([{ header: added.header, body: addedBody }]);
    assert.equal(
      focusPatch(newFile, [added], fileFocus([added], [range(3, 4)])),
      patchOf([{ header: "@@ -0,0 +3,2 @@", body: ["+three", "+four"] }]),
    );
    const inserted = hunk(7, 7, [" a", "+b", "+c"]);
    const insertedPatch = patchOf([{ header: inserted.header, body: [" a", "+b", "+c"] }]);
    assert.equal(
      focusPatch(insertedPatch, [inserted], fileFocus([inserted], [range(9, 9)])),
      patchOf([{ header: "@@ -7,0 +9,1 @@", body: ["+c"] }]),
    );
  });

  it("names the notes a collapsed hunk leaves out", () => {
    const focus = fileFocus([first], [range(12, 13)]);
    const notes = letterNotes([
      { path: "a.ts", side: "new", line: 13, body: "shown" },
      { path: "a.ts", side: "new", line: 16, body: "hidden" },
      { path: "a.ts", side: "old", line: 12, body: "shown on old" },
    ]);
    const entry = focus[0];
    assert.ok(entry);
    assert.deepEqual(
      hiddenNotes(first, entry, notes).map((note) => note.letter),
      ["B"],
    );
  });
});
