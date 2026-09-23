import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { DiffLine } from "../../schema/types.ts";
import { isPureRelocation, movedMarkLabel, movedMarks, relocationWord } from "./relocation.ts";

describe("relocationWord", () => {
  it("names a copy, a directory move, and a rename", () => {
    assert.equal(
      relocationWord({ path: "src/util.copy.ts", oldPath: "src/util.ts", relocation: { kind: "copy", similarity: 100 } }),
      "Copied",
    );
    assert.equal(
      relocationWord({ path: "lib/keep.ts", oldPath: "src/keep.ts", relocation: { kind: "rename", similarity: 100 } }),
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
  it("emits one mark per contiguous block", () => {
    const del = (line: number, text: string, peer: number): DiffLine => ({
      kind: "del",
      oldNumber: line,
      newNumber: null,
      text,
      moved: { path: "src/beta.ts", line: peer },
    });
    const add = (line: number, text: string, peer: number): DiffLine => ({
      kind: "add",
      oldNumber: null,
      newNumber: line,
      text,
      moved: { path: "src/alpha.ts", line: peer },
    });
    const marks = movedMarks([
      {
        lines: [del(2, "export function moved() {", 3), del(3, "  return 1;", 4), del(4, "}", 5)],
      },
      {
        lines: [add(3, "export function moved() {", 2), add(4, "  return 1;", 3), add(5, "}", 4)],
      },
    ]);
    assert.deepEqual(marks, [
      { side: "old", line: 2, peerPath: "src/beta.ts", peerLine: 3 },
      { side: "new", line: 3, peerPath: "src/alpha.ts", peerLine: 2 },
    ]);
    assert.equal(movedMarkLabel("src/alpha.ts", marks[0]!), "to src/beta.ts:3");
    assert.equal(movedMarkLabel("src/beta.ts", marks[1]!), "from src/alpha.ts:2");
    assert.equal(
      movedMarkLabel("src/app.ts", { side: "new", line: 8, peerPath: "src/app.ts", peerLine: 2 }),
      "from line 2",
    );
  });
});

describe("isPureRelocation", () => {
  it("is true only for a text file with a relocation and no line delta", () => {
    assert.equal(isPureRelocation({ kind: "text", added: 0, removed: 0, relocation: { kind: "rename", similarity: 100 } }), true);
    assert.equal(isPureRelocation({ kind: "text", added: 1, removed: 0, relocation: { kind: "rename", similarity: 80 } }), false);
    assert.equal(isPureRelocation({ kind: "image", added: 0, removed: 0, relocation: { kind: "rename", similarity: 100 } }), false);
    assert.equal(isPureRelocation({ kind: "text", added: 0, removed: 0 }), false);
  });
});
