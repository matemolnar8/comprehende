import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { peekFiles } from "./peek-files.ts";

describe("peekFiles", () => {
  it("keeps four or fewer paths so the remainder is never 1", () => {
    assert.deepEqual(peekFiles(["a", "b", "c", "d"]), { shown: ["a", "b", "c", "d"], rest: 0 });
    assert.deepEqual(peekFiles(["a"]), { shown: ["a"], rest: 0 });
  });

  it("caps at three and counts the rest once there are five", () => {
    assert.deepEqual(peekFiles(["a", "b", "c", "d", "e"]), { shown: ["a", "b", "c"], rest: 2 });
  });
});
