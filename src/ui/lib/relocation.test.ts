import assert from "node:assert/strict";
import { describe, it } from "vite-plus/test";
import type { DiffLine } from "../../schema/types.ts";
import { isPureRelocation, movedMarkLabel, movedMarks, relocationWord } from "./relocation.ts";

describe("relocationWord", () => {
  it("names a copy, a directory move, and a rename", () => {
    assert.equal(
      relocationWord({
        path: "src/util.copy.ts",
        oldPath: "src/util.ts",
        relocation: { kind: "copy", similarity: 100 },
      }),
      "Copied",
    );
    assert.equal(
      relocationWord({
        path: "lib/keep.ts",
        oldPath: "src/keep.ts",
        relocation: { kind: "rename", similarity: 100 },
      }),
      "Moved",
    );
    assert.equal(
      relocationWord({
        path: "src/helpers.ts",
        oldPath: "src/util.ts",
        relocation: { kind: "rename", similarity: 80 },
      }),
      "Renamed",
    );
    assert.equal(relocationWord({ path: "src/app.ts" }), undefined);
  });
});

describe("movedMarks", () => {
  const ctx = (old: number, now: number): DiffLine => ({
    kind: "ctx",
    oldNumber: old,
    newNumber: now,
    text: "",
  });
  const del = (line: number, peer: number): DiffLine => ({
    kind: "del",
    oldNumber: line,
    newNumber: null,
    text: "",
    moved: { path: "src/beta.ts", line: peer },
  });
  const add = (line: number, peer: number): DiffLine => ({
    kind: "add",
    oldNumber: null,
    newNumber: line,
    text: "",
    moved: { path: "src/alpha.ts", line: peer },
  });

  it("emits one mark per contiguous block, anchored on the line before it", () => {
    const marks = movedMarks([
      { lines: [ctx(1, 1), del(2, 3), del(3, 4), del(4, 5)] },
      { lines: [add(3, 2), add(4, 3), add(5, 4)] },
    ]);
    assert.deepEqual(marks, [
      { side: "old", line: 2, end: 4, anchor: 1, peerPath: "src/beta.ts", peerLine: 3 },
      { side: "new", line: 3, end: 5, anchor: 3, peerPath: "src/alpha.ts", peerLine: 2 },
    ]);
  });

  it("starts a new block where the peer lines stop running on", () => {
    const marks = movedMarks([{ lines: [del(2, 3), del(3, 9)] }]);
    assert.deepEqual(
      marks.map((mark) => [mark.line, mark.end, mark.anchor]),
      [
        [2, 2, 2],
        [3, 3, 2],
      ],
    );
  });

  it("names the moved range and its peer", () => {
    const [toBeta, fromAlpha] = movedMarks([
      { lines: [ctx(1, 1), del(2, 2), del(3, 3), del(4, 4), del(5, 5), del(6, 6)] },
      { lines: [add(8, 2)] },
    ]);
    assert.deepEqual(movedMarkLabel("src/alpha.ts", toBeta!), {
      text: "Lines 2–6 moved to",
      path: "src/beta.ts:2",
    });
    assert.deepEqual(movedMarkLabel("src/beta.ts", fromAlpha!), {
      text: "Line 8 moved from",
      path: "src/alpha.ts:2",
    });
    assert.deepEqual(movedMarkLabel("src/alpha.ts", fromAlpha!), {
      text: "Line 8 moved from line 2",
    });
  });
});

describe("isPureRelocation", () => {
  it("is true only for a text file with a relocation and no line delta", () => {
    assert.equal(
      isPureRelocation({
        kind: "text",
        added: 0,
        removed: 0,
        relocation: { kind: "rename", similarity: 100 },
      }),
      true,
    );
    assert.equal(
      isPureRelocation({
        kind: "text",
        added: 1,
        removed: 0,
        relocation: { kind: "rename", similarity: 80 },
      }),
      false,
    );
    assert.equal(
      isPureRelocation({
        kind: "image",
        added: 0,
        removed: 0,
        relocation: { kind: "rename", similarity: 100 },
      }),
      false,
    );
    assert.equal(isPureRelocation({ kind: "text", added: 0, removed: 0 }), false);
  });
});
